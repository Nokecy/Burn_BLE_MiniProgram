/*转换成需要的格式*/
const buf2string = (buffer) => {
    let arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
    return arr.map((char, i) => {
        return String.fromCharCode(char);
    }).join('');
}

const receiveData = (buf) => {
    return hexCharCodeToStr(ab2hex(buf))
}

/*转成二进制*/
const ab2hex = (buffer) => {
    let hexArr = Array.prototype.map.call(
        new Uint8Array(buffer), function (bit) {
            return ('00' + bit.toString(16)).slice(-2)
        }
    )
    return hexArr.join('')
}

/*转成可展会的文字*/
const hexCharCodeToStr = (hexCharCodeStr) => {
    let trimedStr = hexCharCodeStr.trim();
    let rawStr = trimedStr.substr(0, 2).toLowerCase() === '0x' ? trimedStr.substr(2) : trimedStr;
    let len = rawStr.length;
    let curCharCode: any;
    let resultStr: any[] = [];
    for (let i = 0; i < len; i = i + 2) {
        curCharCode = parseInt(rawStr.substr(i, 2), 16);
        resultStr.push(String.fromCharCode(curCharCode));
    }
    return resultStr.join('');
}

export { buf2string, receiveData, ab2hex, hexCharCodeToStr }