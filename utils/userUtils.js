function cleanString(str) {
    if (!str) return "";
    return str.trim();
}

function cleanNumber(num) {
    if (num === undefined || num === null) return null;
    return Number(num);
}

module.exports = {
    cleanString,
    cleanNumber
};
