//  /*转换成需要的格式*/
//  buf2string(buffer) {
//     var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
//     return arr.map((char, i) => {
//         return String.fromCharCode(char);
//     }).join('');
// },
// receiveData(buf) {
//     return this.hexCharCodeToStr(this.ab2hex(buf))
// },
// /*转成二进制*/
// ab2hex (buffer) {
// var hexArr = Array.prototype.map.call(
//   new Uint8Array(buffer), function (bit) {
//       return ('00' + bit.toString(16)).slice(-2)
//   }
// )
// return hexArr.join('')
// },
// /*转成可展会的文字*/
// hexCharCodeToStr(hexCharCodeStr) {
// var trimedStr = hexCharCodeStr.trim();
// var rawStr = trimedStr.substr(0, 2).toLowerCase() === '0x' ? trimedStr.substr(2) : trimedStr;
// var len = rawStr.length;
// var curCharCode;
// var resultStr = [];
// for (var i = 0; i < len; i = i + 2) {
//   curCharCode = parseInt(rawStr.substr(i, 2), 16);
//   resultStr.push(String.fromCharCode(curCharCode));
// }
// return resultStr.join('');
// },