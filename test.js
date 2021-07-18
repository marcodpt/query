import query from './index.js'

const str = X => {
  return JSON.stringify(X, undefined, 2)
}

QUnit.test("extreme cases", assert => {
  assert.equal(str(query('')), str({}))
  assert.equal(str(query('a')), str({}))
  assert.equal(str(query(false)), str({}))
  assert.equal(str(query(true)), str({}))
  assert.equal(str(query(3.14)), str({}))
  assert.equal(str(query(7)), str({}))
  assert.equal(query(null), '')
  assert.equal(query(undefined), '')
  assert.equal(query({}), '')
  assert.equal(query([]), '')
})

QUnit.test("get", assert => {
  assert.equal(str(query('a=3')), str({a: '3'}))
  assert.equal(str(query('a=false')), str({a: 'false'}))
  assert.equal(str(query('a=')), str({a: ''}))
  assert.equal(str(query('a[]=')), str({a: ['']}))
  assert.equal(str(query('a=3&b=5')), str({a: '3', b: '5'}))
  assert.equal(str(query('a=3&b=5&c=dog')), str({a: '3', b: '5', c: 'dog'}))
  assert.equal(str(query('a=3&b=5&c=dog&c=cat')), str({
    a: '3',
    b: '5',
    c: ['dog', 'cat']
  }))
  assert.equal(str(query('a.b=car')), str({
    a: {b: 'car'}
  }))
  assert.equal(str(query('a.b.c=car')), str({
    a: {b: {c: 'car'}}
  }))
  assert.equal(str(query('a.b.x[]=bike')), str({
    a: {b: {x: ['bike']}}
  }))
  assert.equal(str(query('a.b=car&a.c=3.14')), str({
    a: {
      b: 'car',
      c: '3.14'
    }
  }))
  assert.equal(str(query('a.b.c=car&a.b.x[]=bike&a.c=3.14')), str({
    a: {
      b: {
        c: 'car',
        x: ['bike']
      },
      c: '3.14'
    }
  }))
  assert.equal(str(query([
    'a.b.c=car',
    'a.b.x=bike',
    'a.c=3.14',
    'a.b.x=dog',
    'a.b.c.d=2.7',
    'a.b.c.e=19',
    'a.b.x.y=bird'
  ].join('&'))), str({
    a: {
      b: {
        c: [
          'car',
          {d: '2.7'},
          {e: '19'}
        ],
        x: [
          'bike',
          'dog',
          {y: 'bird'}
        ]
      },
      c: '3.14'
    }
  }))
})

QUnit.test("set", assert => {
  assert.equal(query({
    a: undefined,
    b: null,
    c: false,
    d: true,
    e: 0,
    f: 0.0,
    g: 1,
    h: 3.14,
    i: 'dog'
  }), 'c=false&d=true&e=0&f=0&g=1&h=3.14&i=dog')
  assert.equal(query([
    undefined,
    null,
    false,
    true,
    0,
    0.0,
    1,
    3.14,
    'dog'
  ]), '2=false&3=true&4=0&5=0&6=1&7=3.14&8=dog')
  assert.equal(query({
    x: [
      undefined,
      null,
      false,
      true,
      0,
      0.0,
      1,
      3.14,
      'dog'
    ]
  }), [
    'x%5B%5D=false',
    'x%5B%5D=true',
    'x%5B%5D=0',
    'x%5B%5D=0',
    'x%5B%5D=1',
    'x%5B%5D=3.14',
    'x%5B%5D=dog',
  ].join('&'))
  assert.equal(query({a: null}), '')
  assert.equal(query({a: {b: null}}), '')
  assert.equal(query({a: {b: null}, c: undefined}), '')
  assert.equal(query({a: 3}), 'a=3')
  assert.equal(query({a: 0}), 'a=0')
  assert.equal(query({a: false}), 'a=false')
  assert.equal(query({a: ''}), 'a=')
  assert.equal(query({a: ['']}), 'a%5B%5D=')
  assert.equal(query({a: '3', b: '5'}), 'a=3&b=5')
  assert.equal(query({a: '3', b: '5', c: 'dog'}), 'a=3&b=5&c=dog')
  assert.equal(query({
    a: '3',
    b: '5',
    c: ['dog', 'cat']
  }), 'a=3&b=5&c%5B%5D=dog&c%5B%5D=cat')
  assert.equal(query({
    a: {b: 'car'}
  }), 'a.b=car')
  assert.equal(query({
    a: {b: {c: 'car'}}
  }), 'a.b.c=car')
  assert.equal(query({
    a: {b: {x: ['bike']}}
  }), 'a.b.x%5B%5D=bike')
  assert.equal(query({
    a: {
      b: 'car',
      c: '3.14'
    }
  }), 'a.b=car&a.c=3.14')
  assert.equal(query({
    a: {
      b: {
        c: 'car',
        x: ['bike']
      },
      c: '3.14'
    }
  }), 'a.b.c=car&a.b.x%5B%5D=bike&a.c=3.14')
  assert.equal(query({
    a: {
      b: {
        c: [
          'car',
          {d: '2.7'},
          {e: '19'}
        ],
        x: [
          'bike',
          'dog',
          {y: 'bird'}
        ]
      },
      c: '3.14'
    }
  }), [
    'a.b.c.0=car',
    'a.b.c.1.d=2.7',
    'a.b.c.2.e=19',
    'a.b.x.0=bike',
    'a.b.x.1=dog',
    'a.b.x.2.y=bird',
    'a.c=3.14'
  ].join('&'))
})

QUnit.test("merge", assert => {
  assert.equal(query('a=3', 'b=5'), 'a=3&b=5')
  assert.equal(str(query(query('a=3', 'b=5'))), str({
    a: '3',
    b: '5'
  }))
  assert.equal(str(query({
    a: 3
  }, {
    b: 5
  })), str({
    a: 3,
    b: 5
  }))
  assert.equal(query(query({
    a: 3
  }, {
    b: 5
  })), 'a=3&b=5')
  const Data = {
    a: {
      b: {
        c: [
          'car',
          {d: '2.7'},
          {e: '19'}
        ],
        x: [
          'bike',
          'dog',
          {y: 'bird'}
        ]
      },
      c: '3.14'
    }
  }
  assert.equal(str(query(Data, {a: {b: null}})), str({a: {c: '3.14'}}))
  assert.equal(str(query(Data, {a: {b: 'x', d: null}})), str({
    a: {
      b: 'x',
      c: '3.14'
    }
  }))
  assert.equal(str(query(Data, {a: {b: 'x', d: ['dog', 'car']}})), str({
    a: {
      b: 'x',
      c: '3.14',
      d: ['dog', 'car']
    }
  }))
  assert.equal(str(query(Data, {a: {b: 'x', d: ['dog', 'car']}}, {
    a: {
      d: ['car']
    }
  })), str({
    a: {
      b: 'x',
      c: '3.14',
      d: ['car']
    }
  }))
})

QUnit.test("project", assert => {
  assert.equal(str(query({a: 3, b: 5}, ['a'])), str({a: 3}))
  assert.equal(str(query({a: 3, b: 5}, ['a', 'b'])), str({a: 3, b: 5}))
  assert.equal(str(query({a: 3, b: 5}, ['a', 'c'])), str({a: 3}))
  const Data = {
    a: {
      b: {
        c: [
          'car',
          {d: '2.7'},
          {e: '19'}
        ],
        x: [
          'bike',
          'dog',
          {y: 'bird'}
        ]
      },
      c: '3.14'
    }
  }
  assert.equal(str(query(Data, ['a'])), str({
    a: {
      b: {
        c: [
          'car',
          {d: '2.7'},
          {e: '19'}
        ],
        x: [
          'bike',
          'dog',
          {y: 'bird'}
        ]
      },
      c: '3.14'
    }
  }))
  assert.equal(str(query(Data, ['a.c'])), str({
    a: {
      c: '3.14'
    }
  }))
  assert.equal(str(query(Data, ['a.b'])), str({
    a: {
      b: {
        c: [
          'car',
          {d: '2.7'},
          {e: '19'}
        ],
        x: [
          'bike',
          'dog',
          {y: 'bird'}
        ]
      }
    }
  }))
  assert.equal(str(query(Data, ['a.b.x'])), str({
    a: {
      b: {
        x: [
          'bike',
          'dog',
          {y: 'bird'}
        ]
      }
    }
  }))
  assert.equal(str(query(Data, ['a.b.x.2'])), str({
    a: {
      b: {
        x: {
          2: {
            y: 'bird'
          }
        }
      }
    }
  }))
  assert.equal(str(query(Data, ['a.b.x.2.y'])), str({
    a: {
      b: {
        x: {
          2: {
            y: 'bird'
          }
        }
      }
    }
  }))
  assert.equal(str(query(Data, ['a.b.x.2.y.z'])), str({}))
  assert.equal(str(query(Data, ['a.b.x', 'a.b.x'])), str({
    a: {
      b: {
        x: [
          'bike',
          'dog',
          {y: 'bird'}
        ]
      }
    }
  }))
  assert.equal(str(query(Data, ['a.b.x', 'a.b.x.2', 'a.c'])), str({
    a: {
      b: {
        x: [
          'bike',
          'dog',
          {y: 'bird'}
        ]
      },
      c: '3.14'
    }
  }))
})

QUnit.test("docs", assert => {
  assert.equal(query({a: 5, b: 'dog'}), 'a=5&b=dog')
  assert.equal(str(query('a=5&b=dog')), str({a: '5', b: 'dog'}))
  assert.equal(str(query({a: 5, b: 'dog'}, {b: 'cat'})), str({a: 5, b: 'cat'}))
  assert.equal(str(query({a: 5, b: 'dog'}, 'a=7&c=x')), str({
    a: '7',
    b: 'dog',
    c: 'x'
  }))
  assert.equal(str(query({a: 5, b: 'dog'}, {b: null})), str({a: 5}))
  assert.equal(query('a=5&b=dog', {b: 'cat'}), 'a=5&b=cat')
  assert.equal(query('a=5&b=dog', 'a=7&c=x'), 'a=7&b=dog&c=x')
  assert.equal(query('a=5&b=dog', {b: null}), 'a=5')
  assert.equal(query('a=5&b=dog&c=cat&d=4', ['b', 'd']), 'b=dog&d=4')
  assert.equal(query(
    'a=5&b=dog&c=cat&d=4',
    {d: 3},
    'b=ball',
    ['a', 'b', 'd']
  ), 'a=5&b=ball&d=3')
  assert.equal(str(query(
    {a: 5, b: 'dog', c: 'cat', d: 4},
    ['b', 'd']
  )), str({b: 'dog', d: 4}))
  assert.equal(query({
    a: {
      b: {
        c: 'ball',
        d: ['john', 'mary']
      }
    }
  }), 'a.b.c=ball&a.b.d%5B%5D=john&a.b.d%5B%5D=mary')
  assert.equal(str(query('a.b.c=ball&a.b.d[]=john&a.b.d%5B%5D=mary')), str({
    a: {
      b: {
        c: 'ball',
        d: ['john', 'mary']
      }
    }
  }))
})
