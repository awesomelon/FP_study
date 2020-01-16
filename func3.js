const person = {
    name: 'nakta',
    age: 10,
    work: 'developer'
};

const pipe = (...fns) => {
    return (...args) => {
        return fns.reverse().reduceRight((res, fn) => [fn.call(null, ...res)], args)[0];
    };
};

const curry = fn => {
    const arity = fn.length;
    return function _curry(...args) {
        if (args.length < arity) {
            return _curry.bind(null, ...args);
        }

        return fn.call(null, ...args);
    };
};

const dissoc3 = curry((dissocKey, obj) => {
    return Object.keys(obj).reduce((acc, key) => {
        if (key === dissocKey) return acc;
        acc[key] = obj[key];
        return acc;
    }, {});
});

const rename3 = curry((keysMap, obj) => {
    return Object.keys(obj).reduce((acc, key) => {
        acc[keysMap[key] || key] = obj[key];
        return acc;
    }, {});
});

/********************* 이전 코드들 ****************************** */

/**
 * 함수자(Functor) : 특정한 조건을 만족하는 객체
 */

class Box {
    constructor(value) {
        this.$value = value;
    }

    static of(value) {
        return new Box(value);
    }

    map(fn) {
        return new Box(fn(this.$value));
    }
}

const box1 = new Box('FP');
const box2 = Box.of('FP2');
const box3 = Box.of(Box.of('FP3'));

/**
 * Box클래스는 new 키워드를 이용해서 인스턴스를 만들 수 있고, static메서드 of를 이용해서 만들 수도 있습니다.
 * 보시다시피 Box 클래스에 $value라는 필드에 값을 할당 합니다.
 * $value에 할당할 수 있는 객체는 특별한 타입으로 제한하지 않고 무엇이든 할당할 수 있다.
 */

/**
 * of는 왜 있을까?
 *
 * 그 이유는 함수 합성을 할 때 new 키워드를 쓰기가 까다롭기 때문이다.
 * 그래서 new 키워드를 쓰는 대신 of메서드를 이용하면 됩니다.
 */

pipe(dissoc3('age'), rename3({ work: 'job' }))(person); // {name : 'nakta', job:'developer'}

// 이 값을 Box에 넣고 싶다면
// 하지만 뭔가 깔끔하지 않다.
pipe(dissoc3('age'), rename3({ work: 'job' }), value => new Box(value))(person);

// of를 쓴다면
console.log(pipe(dissoc3('age'), rename3({ work: 'job' }), Box.of)(person));

/**
 * 상자에 있는 값을 바꾸고 싶다.
 */

// 상자에 있는 값 직접 접근하기

const books = [
    { id: 'book1', title: 'coding with javascript' },
    { id: 'book2', title: 'speaking javaScript' }
];

// 첫 글자를 대문자로 바꿔줍니다.
const startCase = str => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const prop = curry((propName, obj) => {
    return obj[propName];
});

const findBookById = curry((id, books) => {
    return books.find(book => book.id === id);
});

const map = curry((fn, functor) => {
    return functor.map(fn);
});

const getUpperBookTitleById = (id, books) => {
    /**
     * Box.of로 books를 상자 안에 넣었습니다.
     * 상자 안에 넣은 books를 이용해야 하기 때문에
     * box.$value를 이용해서 books에 접근합니다.
     * prop 함수를 이용해서 title값을 가져오고, 최종적으로 startCase 함수를 이용해서 첫 글자를 대문자로 바꿔줍니다.
     */
    return pipe(Box.of, box => findBookById(id, box.$value), prop('title'), startCase)(books);
};

console.log(getUpperBookTitleById('book1', books)); // Coding with javascript
console.log(getUpperBookTitleById('book2', books)); // Speaking javascript

/**
 * 상자를 유지해서 값 바꿔주기(함수자)
 *
 * 위의 함수는 상자에 값을 넣고 다시 빼서 쓴다.
 * 하지만 넣고 다시 꺼내 쓸꺼면 애초에 안 넣으면 되지 않을까?
 * 상자에 값을 넣는 행동이 의미 있게 상자 안에 값을 유지한 상태로 바꿔보자
 *
 * class에 map 메서드 추가
 *
 * map(fn){
 *     return new Box(fn(this.$value))
 * }
 *
 * 파라미터로 함수를 넘긴다.
 * 그리고 그 함수를 상자 안에 넣은 값에 적용한다.
 * 마지막으로 다시 Box로 감싸서 반환한다.
 * 즉, 상자 안에 값이 있고 이 값에 함수를 적용해서 새로운 상자를 반환한다.
 *
 */

const addFive = num => {
    return num + 5;
};
console.log(Box.of(1).map(addFive)); // $value 6
console.log(
    Box.of(1)
        .map(addFive)
        .map(addFive)
); // $value 11
console.log(Box.of('hello, FP').map(startCase)); // $value Hello, FP

/**
 * Box에 값을 넣고 map 메서드를 이용하면 Box를 유지한 채로 값을 변경할 수 있게 됐습니다.
 * 게다가 반환 값이 Box 인스턴스이므로 반환 값에 다시 amp을 이용해서 값을 변경할 수 있다.
 * 사실 값을 변경했다기 보다 함수를 이용해서 새로운 Box인스턴스를 반환했다.
 */

/**
 * 함수자 : 같은 타입을 반환하는 map메서드를 구현한 객체.
 *
 * 특별할 것 없는 객체입니다.
 * Box는 map메서드를 구현합니다.
 * 이 때 map의 결과는 다시 Box 인스턴스를 반환합니다.
 * 위 조건에 부합하기 때문에 Box는 함수자(Functor)라고 할 수 있다.
 *
 *
 * Array도 함수자
 *
 * map이라는 메서드는 자바스크립트 Array타입에도 있는 메서드
 * Array.prototype.map을 이용하면 배열을 순회하면서 map으로 넘겨준 함수를 적용한 결과 배열을 다시 반환해준다.
 * 함수자의 조건을 만족한다.
 * Array도 함수자!
 */

const getUpperBookTitleById2 = (id, books) => {
    return pipe(Box.of, map(findBookById(id)), map(prop('title')), map(startCase))(books);
};

console.log(getUpperBookTitleById2('book1', books));
console.log(getUpperBookTitleById2('book2', books));

/**
 * Box에 있는 $value에 직접 접근하는 대신 map메서드를 이용해서 최종적으로 원하는 책 제목을 찾아냈다.
 * 굳이 값을 상자 안에 넣어서 이렇게 이용하는 목적이 뭘까?
 */

/**
 * 함수자는 왜 쓸까? : 예외처리를 위한 함수자
 *
 * 함수 합성을 이용해서 함수형 프로그래밍을 할 때 문제가 하나 있다.
 * 예외처리가 힘들다는 점.
 *
 * ex)
 * books에는 book1, book2가 있지만 book3은 없다.
 * book3을 찾으려고 하면
 *
 * console.log(getUpperBookTitleById2('book1', books)); Box('Coding with javascript')
 * console.log(getUpperBookTitleById2('book2', books)); Box('Speaking javascript')
 * console.log(getUpperBookTitleById2('book3', books)); // Cannot read property 'title' of undefined
 *
 * findBookById에서 book3이라는 아이디로 책을 찾을 때 결과로 undefined를 반환
 * 반환된 undefined가 prop('title')로 넘어가 undefined['title']을 실행하기 때문.
 *
 *
 *
 *
 * 우아한 해결책 (Maybe)
 *
 * 위 문제를 해결할 우아한 방법.
 * 함수자를 이용한 방법
 *
 * 일반적으로 Maybe함수자는 두 가지 상태를 가진다.
 * Nothing과 Just입니다.
 *
 * Nothing은 $value가 null이거나 undefined인 경우입니다.
 * 그 외 값을 가진 경우는 Just
 *
 * Box에서는 $value값에 fn을 무조건 적용했다.
 * 하지만 Maybe에서는 Nothing상태일떄는 fn 함수를 적용하지 않고 Nothing상태의 Maybe를 그대로 반환
 */
class Maybe {
    constructor(value) {
        this.$value = value;
    }

    static of(value) {
        return new Maybe(value);
    }

    get isNothing() {
        return this.$value === null || this.$value === undefined;
    }

    map(fn) {
        return this.isNothing ? this : Maybe.of(fn(this.$value));
    }

    toString() {
        return this.isNothing ? 'Nothing' : `Just(${this.$value})`;
    }
}

const getUpperBookTitleById3 = (id, books) => {
    return pipe(Maybe.of, map(findBookById(id)), map(prop('title')), map(startCase))(books);
};

console.log(getUpperBookTitleById3('book1', books).toString()); // Just('Coding with javascript')
console.log(getUpperBookTitleById3('book2', books).toString()); // Just('Speaking javaScript')
console.log(getUpperBookTitleById3('book3', books).toString()); // Nothing

/**
 * Box를 Maybe로 바꿨을 뿐인데 에러없이 결과만 Nothing상태의 Maybe가 나왔다.
 *
 * Maybe.of(books)는 Just(books)가 됩니다.
 * 다음 단계에서 map(findBookById(id))를 실행할 때 id가 book3인 경우 결과가 undefined.
 * 이 때 Maybe의 $value가 undefined가 되면서 상태는 Nothing으로 바뀐다.
 * 이 때부터는 map(prop('title'))과 map(startCase) 두 함수 모두 실행하지 않고 Nothing을 반환.
 *
 * 즉, Maybe를 이용하면 $value값이 null 또는 undefined가 되는 순간 뒤에 이어지는 함수는 모두 무시
 */

/**
 * 함수자 값 꺼내기
 *
 * 지금까지 처리한 결과는 모두 함수자 형태.
 * Nothing 또는 Just형태였다.
 * 우리가 상자 안에 값을 넣어서 처리했기 때문에 어찌됐건 마지막 단계에서는 값을 꺼내서 사용해야 한다.
 * Nothing 상태인 경우 default값을 반환할 수 있는 도우미 함수를 만들어 보도록 하겠다.
 */

const getOrElse = curry((defaultValue, fn, maybe) => {
    return maybe.isNothing ? defaultValue : fn(maybe.$value);
});

/**
 * getOrElse 함수는 세 개의 파라미터를 받아서 처리.
 * 첫 번째 값은 maybe가 Nothing일 때 반환 할 기본값
 * 두 번째는 Just일 때 최종적으로 $value에 적용할 함수.
 * 마지막은 Maybe인스턴스
 */

const getUpperBookTitleById4 = (id, books) => {
    return pipe(
        Maybe.of,
        map(findBookById(id)),
        map(prop('title')),
        getOrElse(`${id} Not Found`, startCase)
    )(books);
};

console.log(getUpperBookTitleById4('book1', books));
console.log(getUpperBookTitleById4('book2', books));
console.log(getUpperBookTitleById4('book3', books));
