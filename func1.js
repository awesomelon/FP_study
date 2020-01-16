const names = ['leah kelly', 'christian_Nolan', 'Alexander james', 'Tim-Mackenzie', 'dan_Hunter', 'Ryan Bower', 'Frank_chapman', 'Dorothy-Sanderson', 'Fiona_Glover', 'Robert Edmunds'];

/**
 * 함수지향
 */
const replaceSpace = str => {
    return str.replace(/(_|-)/, ' ');
};

const startCase = str => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const changePartStartCase = str => {
    return str.split(' ').join(' ');
};

console.log(
    names
        .map(name => replaceSpace(name))
        .map(name => startCase(name))
        .map(name => changePartStartCase(name))
        .sort()
);
