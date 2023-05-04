/**
 *
 * @param lat
 * @param long
 * @returns
 */
function coordinate(lat: number, long: number) {
  let _lat = lat;
  let _long = long;
  return {
    latitude: function () {
      return _lat;
    },
    longitude: function () {
      return _long;
    },
    translate: function (dx: any, dy: any) {
      return coordinate(_lat + dx, _long + dy); // 返回翻译过的坐标副本
    },
    toString: function () {
      return "(" + _lat + "," + _long + ")";
    },
  };
}

const greenwich = coordinate(51.4778, 0.0015); // ->

console.log("greenwich.toString()", greenwich.toString());
