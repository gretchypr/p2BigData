
$(document).ready(function(){
    d3.csv("wordCount.csv", function(data) {
        var count = [];
        var words = [];
        for (var i = 0 ; i < data.length; i++) {
            count[i] = parseInt(data[i]["Count"]);
            words[i]= data[i]["Word"];
        }
        displayWordCountChart(words, count);
    });
      displayReplyChart();
      displayUserMessageChart();
      displayUsernameChart();
      displayKeywordChart();
});
