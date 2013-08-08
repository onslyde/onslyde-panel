var barChart = (function($) {
  var voteOptions = [];

  function VoteOption(name) {
    this.name = name;
    this.numVotes = 0;
  }

  function clearVoteOptions() {
    voteOptions = [];
  }

  function addVoteOption(voteOptionName) {
    var voteOption = new VoteOption(voteOptionName);
    voteOptions.push(voteOption);
  }

  function addVote(name) {
    for (var i = 0; i < voteOptions.length; i++) {
      if (voteOptions[i].name == name) {
        voteOptions[i].numVotes += 1;
      }
    }
  }

  function getVotes(index) {
    var data = [];
    var numVotes = voteOptions[index].numVotes
    var newArr = [numVotes, index];
    data.push(newArr);
    return data;
  }

  function Series(data) {
    this.data = data;
    this.bars = { show: true }
  }

  function getChartData() {
    var dataArr = [];
    for (var i = 0; i < voteOptions.length; i++) {
      var data = getVotes(i);
      var series = new Series(data);
      dataArr.push(series);
    }
    return dataArr;
  }

  function getChartOptions() {
    return {
      series: {
        bars: {
          barWidth: 1,
          align: "center",
          horizontal: true
        }
      },
      xaxis: {
        position: 'bottom',
        tickDecimals: 0,
        tickSize: 1,
        min: 0
      },
      yaxis: {
        ticks: getTicks(),
        transform: function (v) { return -v; },
        inverseTransform: function (v) { return -v; }
      }
    }
  };

  function getTicks() {
    var ticks = [];
    for (var i = 0; i < voteOptions.length; i++) {
      var voteOptionName = voteOptions[i].name;
      var tick = [i, voteOptionName];
      ticks.push(tick);
    }
    return ticks;
  }

  function drawChart() {
    $.plot($(".placeholder"), getChartData(), getChartOptions());
  }

  return {
    addVoteOption: addVoteOption,
    clear: clearVoteOptions,
    draw: drawChart,
    redraw: drawChart,
    vote: addVote
  }
})(jQuery);