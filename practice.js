let distance = getDistanceOfAreaFromOnePlaceToAnother(1,2,3,4);
var a= 3;
var b= 3;
var arr = []
if (a == 3) {
    arr.push(distance);
    arr.push(3);
    console.log(arr);

    var fromDate = getDateMillisecFromDateSting("11/22/12");
    var toDate = getDateMillisecFromDateSting("11/25/12");
    var dateForCheck = getDateMillisecFromDateSting("11/23/12");

    var dateResult = isDateInsideOfDateRange(fromDate, toDate, dateForCheck);
    console.log(dateResult);
    console.log("Now");
    console.log(Date.now());

}

function getDistanceOfAreaFromOnePlaceToAnother(fromLat, fromLng, toLat, toLng) {
    let disLatKM;
    let disLngKM;

    if (fromLat < toLat) {
        disLatKM = (toLat - fromLat) * 111.0;
        disLngKM = (toLng - fromLng) * 111.0;
        return Math.sqrt((disLatKM * disLatKM) + (disLngKM * disLngKM))
    } else {
        disLatKM = (fromLat - toLat) * 111.0;
        disLngKM = (fromLng - toLng) * 111.0;
        return Math.sqrt((disLatKM * disLatKM) + (disLngKM * disLngKM))
    }
}

function isDateInsideOfDateRange(fromDateMillisec, toDateMillisec, dateForCheckMillisec){
    if (dateForCheckMillisec >= fromDateMillisec && dateForCheckMillisec <= toDateMillisec){
        var different = toDate - fromDate;
        console.log("Different: "+ different);
        return true;
    }else{
        return false;
    }
}
function getDateMillisecFromDateSting(dateString){
    //var date = Date.parse("11/22/12");
    return Date.parse(dateString);
}


