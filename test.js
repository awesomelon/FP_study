var arr = [1, 2, 1, 4, 4];

var uniqueArr = function(arr) {
    return arr.reduce(function(acc, curr, index) {
        acc.indexOf(curr) > -1 ? null : (acc[index] = curr);
        return acc;
    }, []);
};

var result = uniqueArr(arr)
    .filter(function(e) {
        return e;
    })
    .map(function(el) {
        return el.toString();
    });

console.log(result);
