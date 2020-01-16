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

const prop = curry((propName, obj) => {
    return obj[propName];
});

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

/**
 * Maybe : 멋있지만 살짝 모자란 친구
 * map을 이용해서 함수 컴포지션을 할 때 Nothing이 되는 순간 그 뒤로 실행해야 할 map을 모두 무시할 수 있었다.
 * 그리고 마지막엔 Maybe가 들고 있는 값을 뽑아내거나 Nothing인 경우 기본값을 지정해줄 수 있었다.
 *
 * Maybe의 한계
 *
 * 만약 마지막에 기본값을 리턴해 주는게 아니라 특별한 처리를 하고 싶은 경우는?
 *
 * ex)
 * books에서 아이디로 책을 찾아서 저자명을 로그로 찍어주고
 * 저자명이 Axel인 경우 console.log();
 * 아닌 경우 console.error();
 *
 */

const books = [
    { id: 'book1', title: 'coding with javascript', author: 'Chris Minnick, Eva Holland' },
    { id: 'book2', title: 'speaking javaScript', author: 'Axel Rauschmayer' }
];

// 책을 찾는 함수, 책 아이디와 책 목록을 받아서 책을 찾아 반환
const findBookById = curry((id, books) => {
    return books.find(book => book.id === id);
});

// 책 저자가 Axel인 경우 Just를 반환
// 아닌 경우 Nothing을 반환

const validateBookAuthor = book => {
    return book.author.indexOf('Axel') > -1 ? Maybe.of(book) : Maybe.of(null);
};

const logBookAuthor = (bookId, books) => {
    return pipe(findBookById(bookId), validateBookAuthor)(books);
};

logBookAuthor('book1', books); // Nothing
logBookAuthor('book2', books); // Just({ id: 'book2', title: 'speaking javaScript', author: 'Axel Rauschmayer' })

const logByMaybeStatus = maybeAxelBook => {
    if (maybeAxelBook.isNothing) {
        // console.error();
    } else {
        // console.log();
        console.log(maybeAxelBook.$value.author);
    }
};

// 다음으로 저자명을 로그로 찍기. Just인 경우만 저자명이 Axel이므로 상태를 확인해줘야한다.
const logBookAuthor2 = (bookId, books) => {
    return pipe(findBookById(bookId), validateBookAuthor, logByMaybeStatus)(books);
};

logBookAuthor2('book1', books); //
logBookAuthor2('book2', books); // Axel Rauschmayer

/**
 * Nothing인 경우에도 로그로 찍어주고 싶어도
 * Nothing인 경우 $value 값이 undefined이거나 null이다.
 */

/**
 * Either : Maybe보다 한수 위
 *
 * 에러처리시에 참조할 값을 들고 있는 함수자
 *
 * Maybe의 상태가 Just와 Nothing 두 가지인 것처럼 Either의 상태는 Left와 Right 두 가지 입니다.
 * Left인 경우가 Nothing에 매칭되고 Right인 경우가 Just에 매칭 된다고 생각하면 됩니다.
 *
 * 생성자로부터 받은 값을 $value에 저장합니다.
 * 그리고 static메서드로 right와 left를 가집니다.
 *
 * 각 메서드를 이용해서 Right 또는 Left 인스턴스를 만들게 됩니다.
 */

class Either {
    constructor(value) {
        this.$value = value;
    }

    static right(value) {
        return new Right(value);
    }

    static left(value) {
        return new Left(value);
    }
}

class Right extends Either {
    get isRight() {
        return true;
    }

    get isLeft() {
        return false;
    }

    map(fn) {
        return new Right(fn(this.$value));
    }
}

class Left extends Either {
    get isRight() {
        return false;
    }

    get isLeft() {
        return true;
    }

    map(fn) {
        return this;
    }
}

const concat = curry((str1, str2) => {
    return `${str1}${str2}`;
});

Either.right('Star').map(concat('Super')); // Right { '$value' : 'SuperStar }
Either.left('Star').map(concat('Sueper')); // Left { '$value' : 'Star }

Either.right({ name: 'Nakta', job: 'Developer' }).map(prop('name')); // Right { '$value' : 'Nakta' }
Either.left({ name: 'Nakta', job: 'Developer' }).map(prop('name')); // Left { '$value' : 'Nakta', job:"Developer" }
