// by_suggesttest

var data = [],i = 0,data2 = [];
function(doc) {
  if ((doc['model'] == 'Jobdata') && (doc['sitesrcid'] != null)) {
    var index= doc['occupation'];
	//alert(doc['occupation']);
	//    log("hallo " + doc['occupation']);
    for (bla in data) {
        i = bla;

        if (data[bla] === doc['occupation']) {
           // Save id in value
	//	data.bla.push(doc['_id'];
               log(data.bla);
	   break; 
	
           }
	}
log(data[i] + " " + doc['occupation'] + " " + i);
    if (data[i] != doc['occupation']) {
      data.push(doc['occupation']);
	  emit(index, data);
    }
//function(data) {
  
//}
    //emit(doc['joblocation'],null);
  }
}


// by_suggest

function(doc) {
  if ((doc['model'] == 'Jobdata') && (doc['sitesrcid'] != null)) {
    emit(doc['occupation'], null);
    emit(doc['joblocation'],null);
  }
}

//reduce
function(keys, values, rereduce) {
  var unique_labels = {};
  values.forEach(function(label) {
    if(!unique_labels[label]) {
      unique_labels[label] = true;
    }
  });

  return unique_labels;
}
