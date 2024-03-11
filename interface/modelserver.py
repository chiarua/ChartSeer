import simplejson as json
import os, sys, re
from multiprocessing import Pool
import nltk
import numpy as np
from scipy.optimize import minimize
from scipy.spatial import procrustes
import h5py

from keras import backend as K
import tensorflow as tf

from sklearn.decomposition import PCA
from sklearn.manifold import MDS, smacof

from flask import Flask, jsonify, request
from flask_cors import CORS

from gvaemodel.vis_vae import VisVAE, get_rules, get_specs
from gvaemodel.vis_grammar import VisGrammar

from gevent import pywsgi

port = 5000
rulesfile = './gvaemodel/rules-cfg.txt'
modelsave = './gvaemodel/vae_H256_D256_C444_333_L20_B200.hdf5'

m = re.search(r'_L(\d+)_', modelsave)

MAX_LEN = 20
LATENT = int(m.group(1))

# rules = []
# with open(rulesfile, 'r') as inputs:
#     for line in inputs:
#         line = line.strip()
#         rules.append(line)

# visvae = VisVAE(modelsave, rules, MAX_LEN, LATENT)
# graph = tf.get_default_graph()

# pca = PCA(n_components=2)

visvae = None
graph = None
sess = None
pca = None

app = Flask(__name__) #这行代码创建了一个新的Flask web应用实例。
CORS(app) #这是一个装饰器，它为应用程序启用跨源资源共享（CORS），允许来自不同源的请求。

'''
这是一个自定义的异常类，用于处理应用程序中的错误。当抛出这个异常时，它会带有一个消息、一个状态码和一个负载
'''
class InvalidUsage(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv
'''
这是一个装饰器，它告诉Flask如果抛出了InvalidUsage异常，应该调用handle_invalid_usage函数来处理。
'''
@app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

'''
这是一个路由装饰器，它告诉Flask当用户向/encode端点发送POST请求时，应该调用encode函数。encode函数从请求中获取JSON数据，
然后尝试使用visvae对象的encode方法对数据进行编码，并返回结果。
'''
@app.route('/encode', methods=['POST'])
def encode():
    specs = request.get_json()
    try:
        with graph.as_default():
            tf.keras.backend.set_session(sess)
            z = visvae.encode(specs)
    except Exception as e:
        raise InvalidUsage(e.message)
    return jsonify(z.tolist())

'''
这是另一个路由装饰器，它告诉Flask当用户向/decode端点发送POST请求时，应该调用decode函数。decode函数从请求中获取JSON数据，
然后尝试使用visvae对象的decode方法对数据进行解码，并返回结果。
'''
@app.route('/decode', methods=['POST'])
def decode():
    z = np.array(request.get_json())
    try:
        with graph.as_default():
            tf.keras.backend.set_session(sess)
            specs = visvae.decode(z)
    except Exception as e:
        raise InvalidUsage(e.message)
    return jsonify(specs)


'''
这是一个路由装饰器，它告诉Flask当用户向/orientate端点发送POST请求时，应该调用orientate函数。
orientate函数从请求中获取JSON数据，然后使用procrustes函数对数据进行处理，并返回结果。
'''
@app.route('/orientate', methods=['POST'])
def orientate():
    locations = request.get_json()
    mt1, mt2, disparity = procrustes(locations[0], locations[1]) 
    return jsonify(mt2.tolist())

'''
@app.route('/pca', methods=['POST'])和@app.route('/invpca', methods=['POST'])：这两个路由装饰器分别处理PCA投影和逆PCA投影的请求。
它们从请求中获取JSON数据，然后使用PCA对象对数据进行转换，并返回结果。
'''

@app.route('/pca', methods=['POST'])
def pcaproject():
    global pca
    pca = PCA(n_components=2)
    x = np.array(request.get_json())
    y = pca.fit_transform(x)
    return jsonify(y.tolist())

@app.route('/invpca', methods=['POST'])
def invpcaproject():
    global pca
    y = np.array(request.get_json())
    x = pca.inverse_transform(y)
    return jsonify(x.tolist())


'''
这是一个路由装饰器，它告诉Flask当用户向/mds端点发送POST请求时，应该调用mdsproject函数。mdsproject函数从请求中获取JSON数据，
然后使用多维缩放（MDS）方法对数据进行降维，并返回结果。
'''
@app.route('/mds', methods=['POST'])
def mdsproject():
    distm = np.array(request.get_json())
    mds = MDS(n_components=2, dissimilarity='precomputed', random_state=13, max_iter=3000, eps=1e-9)
    y = mds.fit(distm).embedding_
    # res = smacof(distm, n_components=2, random_state=13, max_iter=3000, eps=1e-9)
    # y = res[0]    
    return jsonify(y.tolist())


'''
这是一个路由装饰器，它告诉Flask当用户向/invmds端点发送POST请求时，应该调用invmdsproject函数。
invmdsproject函数从请求中获取JSON数据，然后使用多进程池对数据进行处理，并返回结果。
'''
@app.route('/invmds', methods=['POST'])
def invmdsproject():
    inputdata = request.get_json()
    ps = np.array(inputdata['points'])
    dsall = np.array(inputdata['distances'])
    
    #res = myminimize((ps, dsall[0]))
    pool = Pool(8)
    res = pool.map(myminimize, [(ps, ds) for ds in dsall])
    res = [r.tolist() for r in res]
    pool.close()
    pool.join()
    return jsonify(res)


'''
这个函数接收一个元组作为参数，元组中包含了点集和距离。
函数首先生成一个随机样本，然后使用minimize函数来最小化目标函数objfun
'''
def myminimize(args):
    ps, ds = args
    x0 = np.random.random_sample(ps[0].shape)
    res = minimize(objfun, x0, args=(ps, ds), tol=1e-9, options={'maxiter':3000})
    return res.x

'''
这个函数计算了点集和距离之间的差异，并返回差异的平方和。
'''
def objfun(x, ps, ds):
    d = np.tile(x, (ps.shape[0], 1)) - ps
    d = np.sum(np.square(d), axis=1)
    diff = np.sqrt(d) - ds
    return np.sum(np.square(diff))


'''
这部分代码首先从文件中读取规则，然后创建一个TensorFlow会话，并设置为Keras的后端会话。然后，它创建了一个VisVAE对象和一个PCA对象。
最后，它创建了一个WSGI服务器，并开始监听请求。
'''
if __name__ == '__main__':
    rules = []
    with open(rulesfile, 'r') as inputs:
        for line in inputs:
            line = line.strip()
            rules.append(line)

    sess = tf.Session()
    tf.keras.backend.set_session(sess)
    visvae = VisVAE(modelsave, rules, MAX_LEN, LATENT)
    graph = tf.get_default_graph()

    pca = PCA(n_components=2)

    server = pywsgi.WSGIServer(('127.0.0.1', 5000), app)
    server.serve_forever()
