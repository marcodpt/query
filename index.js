const getQuery = query => {
  const assign = (X, Path, value) => {
    var path = Path.shift()
    var toArr = path.substr(-2) == '[]'
    if (toArr) {
      path = path.substr(0, path.length - 2)
    }
    const isArr = X[path] instanceof Array
    toArr = toArr || (X[path] != null && !(
      Path.length && typeof X[path] == 'object'
    ))
    if (!isArr && toArr) {
      X[path] = X[path] == null ? [] : [X[path]]
    } else if (X[path] == null) {
      X[path] = {}
    }
    if (toArr || isArr) {
      X[path].push(Path.length ? assign({}, Path, value) : value)
    } else {
      X[path] = Path.length ? assign(X[path], Path, value) : value
    }
    return X
  }

  return query.split('&').reduce((Q, pair) => {
    var P = pair.split('=', 2)
    if (P.length == 2) {
      const key = decodeURIComponent(P[0])
      const value = decodeURIComponent(P[1])
      Q = assign(Q, key.split('.'), value)
    }
    return Q
  }, {})
}

const setQuery = (Q, path) => {
  path = path || ''
  const finish = A => {
    return A.filter(pair => {
      return pair && pair.length
    }).join('&')
  }
  const addPath = next => {
    return path+(path.length ? '.' : '')+next
  }
  if (Q instanceof Array) {
    const terminal = Q.reduce((terminal, value) => {
      return terminal && (typeof value != 'object' || value == null)
    }, true)
    return finish(Q.map((value, i) => {
      return setQuery(value, terminal && path ? (path+'[]') : addPath(i))
    }))
  } else if (Q != null && typeof Q == 'object') {
    return finish(Object.keys(Q).map(key => {
      return setQuery(Q[key], addPath(key))
    }))
  } else if (Q != null) {
    return encodeURIComponent(path)+'='+encodeURIComponent(String(Q))
  } else {
    return ''
  }
}

const merge = (A, B) => {
  return Object.keys(B).reduce((R, key) => {
    const isObj = (X) => X != null &&
      typeof X == 'object' &&
      !(X instanceof Array) 

    if (B[key] == null) {
      delete R[key]
    } else if (!isObj(R[key]) || !isObj(B[key])) {
      R[key] = B[key]
    } else {
      R[key] = merge(R[key], B[key])
    }
    return R
  }, {...A})
}

const project = (A, Paths) => {
  return Paths.reduce((R, path) => {
    const P = path.split('.')
    const l = P.length
    var X = A
    var Y = R
    var Z = null
    var W = null
    var k = null

    const stop = P.reduce((stop, key, i) => {
      const last = i == l - 1
      if (!stop && X[key] != null) {
        if (Y[key] != null && !last) {
          Y = Y[key]
        } else if (k == null) {
          k = key
          if (!last) {
            Z = {}
          } else {
            Z = X[key]
          }
          W = Z
        } else {
          if (!last) {
            W[key] = {}
          } else {
            W[key] = X[key]
          }
          W = W[key]
        }
        X = X[key]
      } else {
        stop = true
      }
      return stop
    }, false)

    if (!stop) {
      Y[k] = Z
    }
    return R
  }, {})
}

export const query = function () {
  const B = arguments[0]
  const isObj = typeof B == 'object' || B == null
  const load = X => {
    if (X == null) {
      return {}
    } else if (typeof X != 'object') {
      return getQuery(String(X))
    } else {
      return X
    }
  }
  var Base = load(B)

  for (var i = 1; i < arguments.length; i++) {
    const A = load(arguments[i])
    if (A instanceof Array) {
      Base = project(Base, A)
    } else {
      Base = merge(Base, A)
    }
  }

  return (isObj && i == 1) || (!isObj && i > 1) ? setQuery(Base) : Base
}
