# Query js
An es6 module javascript query string parser and builder

[Tests](https://marcodpt.github.io/query/)

## Motivation
I needed an es6 module query string parser, but it need to be very simple and
powerful.

There is only one function and you can transform objects in query string, query
string in object, make merges and projections.

## Usage
```js
import query from 'https://cdn.jsdelivr.net/gh/marcodpt/query/index.js'

query({a: 5, b: 'dog'})                     //a=5&b=dog
query('a=5&b=dog')                          //{a: '5', b: 'dog'}
query({a: 5, b: 'dog'}, {b: 'cat'})         //{a: 5, b: 'cat'}
query({a: 5, b: 'dog'}, 'a=7&c=x')          //{a: '7', b: 'dog', c: 'x'}
query({a: 5, b: 'dog'}, {b: null})          //{a: 5}
query('a=5&b=dog', {b: 'cat'})              //a=5&b=cat
query('a=5&b=dog', 'a=7&c=x')               //a=7&b=dog&c=x
query('a=5&b=dog', {b: null})               //a=5
query('a=5&b=dog&c=cat&d=4', ['b', 'd'])    //b=dog&d=4
query(
  'a=5&b=dog&c=cat&d=4',
  {d: 3},
  'b=ball',
  ['a', 'b', 'd']
)                                           //a=5&b=ball&d=3
query(
  {a: 5, b: 'dog', c: 'cat', d: 4},
  ['b', 'd']
)                                           //{b: 'dog', d: 4}

query({
  a: {
    b: {
      c: 'ball',
      d: ['john', 'mary']
    }
  }
}) //a.b.c=ball&a.b.d%5B%5D=john&a.b.d%5B%5D=mary

query('a.b.c=ball&a.b.d[]=john&a.b.d%5B%5D=mary')
//{
//  a: {
//    b: {
//      c: 'ball',
//      d: ['john', 'mary']
//    }
//  }
//}
```

## Contributing
Yes please! It is a very simple project with a single file, no guidelines, any
contribution is greatly appreciated!
