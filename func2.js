/**
 * 함수 컴포지션
 *
 * 함수를 조합하는 것
 */

const pow = (num1, num2) => {
    return Math.pow(num1, num2);
};

const negate = num => {
    return num * -1;
};

const inc = num => {
    return num + 1;
};

/**
 * 절차지향 스타일
 */
const powered = pow(2, 3);
const negated = negate(powered);
const result = inc(negated);

console.log(result);

/**
 * 원초적인 함수 컴포지션
 *
 * 어째 절차지향보다 더 읽기 어렵다.
 *
 * pow(2,3)을 시작으로 nagate, inc순으로 가장 안쪽부터 계산해서 바깥쪽으로 코드를 읽어 나가야 하기 때문
 */
console.log(inc(negate(pow(2, 3))));

/**
 * 조금 더 읽기 편한 함수 컴포지션
 */

// ... fn3, fn2, fn1
/**
 *
 * @param  {Function} fnc
 *
 * 1. 실행할 함수 목록을 넘겨주면 새로운 함수를 반환
 * 2. 새로 반환 받은 함수에 초깃값을 파라미터로 넘겨줍니다.
 * 3. 초깃값을 가지고 실행할 함수 목록을 역순으로 순차적으로 실행해서 최종 결과를 반환
 */
const compose = (...fnc) => {
    return (...args) => {
        /**
         * [fn.call(null, ...res)] : 입력 받은 fnc를 오른쪽부터 실행
         * args : 초기값으로 받은 파라미터
         */
        return fnc.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0];
    };
};

const mySpecialFunc = compose(
    num => inc(num),
    num => negate(num),
    (num1, num2) => pow(num1, num2)
);

console.log(mySpecialFunc(2, 4));

/**
 * Pointfree style로 살짝 더 보기 좋은 함수 컴포지션
 *
 * (num) => inc(num) 형태로 적을 필욘 없다.
 *
 * inc함수는 num이라는 숫자 하나를 받는 함수
 * 익명 함수 (num) => inc(num)도 num이라는 숫자를 받는 함수이다.
 *
 * 이 익명 함수에서는 num을 가지고 그대로 inc를 실행합니다.
 *
 * 결국 익명 함수는 inc와 같다고 생각할 수 있다.
 *
 */

const mySpecialFunc1 = compose(
    num => inc(num),
    num => negate(num),
    (num1, num2) => pow(num1, num2)
);

console.log(mySpecialFunc1(2, 4));

/**
 * 위 생각대로 변경해보면
 */

const mySpecialFunc2 = compose(inc, negate, pow);

console.log(mySpecialFunc2(2, 4));

/**
 * compose의 순서를 바꾸기(pipe)
 *
 * 오른쪽에서 왼쪽으로 흐르는 코드를 왼쪽에서 오른쪽으로 흐르도록 만드는 과정
 *
 * 지금은 pow => negate -> inc로 실행이되는데 오른쪽부터 읽어야해서 뭔가 읽기 불편하니
 * 왼쪽부터 실행되게
 */

const pipe = (...fns) => {
    return (...args) => {
        return fns.reverse().reduceRight((res, fn) => [fn.call(null, ...res)], args)[0];
    };
};

const mySpecialFunc3 = pipe(pow, negate, inc);

console.log(mySpecialFunc3(2, 4));

/**
 * 커링 : 파라미터를 모두 채우지 않는 한 함수로 남아있겠다.
 *
 * ex)
 * person 객체에 아래 조건을 만족하는 결과를 만들고 싶다고 가정
 *
 * 1. age 삭제
 * 2. work라는 키를 job으로 변경
 */

const person = {
    name: 'nakta',
    age: 10,
    work: 'developer'
};

// 키를 삭제할 함수
const dissoc = (dissocKey, obj) => {
    return Object.keys(obj).reduce((acc, key) => {
        if (key === dissocKey) return acc;
        acc[key] = obj[key];
        return acc;
    }, {});
};

// 키 이름을 변경할 함수
const rename = (keysMap, obj) => {
    return Object.keys(obj).reduce((acc, key) => {
        acc[keysMap[key] || key] = obj[key];
        return acc;
    }, {});
};

/**
 * 결과는 잘 나오지만
 *
 * dissoc와 rename이 파라미터를 두 개를 받는 함수이기 때문에 익명 함수를 써야만 함수를 호출 할 수 있다.
 */

console.log(
    pipe(
        person => dissoc('age', person),
        person => rename({ work: 'job' }, person)
    )(person)
);

/**
 * 커링을 이용해보자 : 파라미터를 모두 채우지 않는 한 함수로 남아있겠다.
 *
 * dissoc 함수는 두 개의 파라미터를 받아서 실행하는 함수이다.
 * 커링을 이용한다면 dissoc('age')처럼 파라미터를 하나만 넘겨서 실행할 수 있다.
 * 이 때 반환 값은 두 번째 파라미터를 받는 새로운 함수이다.
 * 즉, 파라미터를 부족하게 채울 경우 그 나머지 파라미터를 받을 수 있는 함수를 반환한다는 뜻.
 */

/**
 * dissoc와 rename에 커링 적용
 */
const dissoc2 = dissocKey => obj => {
    return Object.keys(obj).reduce((acc, key) => {
        if (key === dissocKey) return acc;
        acc[key] = obj[key];
        return acc;
    }, {});
};

const rename2 = keysMap => obj => {
    return Object.keys(obj).reduce((acc, key) => {
        acc[keysMap[key] || key] = obj[key];
        return acc;
    }, {});
};

console.log(pipe(dissoc2('age'), rename2({ work: 'job' }))(person));

/**
 * curry : 커링을 편하게 도와줄 함수
 */

const curry = fn => {
    const arity = fn.length;
    return function _curry(...args) {
        if (args.length < arity) {
            return _curry.bind(null, ...args);
        }

        return fn.call(null, ...args);
    };
};

/**
 * dissoc와 rename에 커리 함수 적용
 */
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

console.log(pipe(dissoc3('age'), rename3({ work: 'job' }))(person));
