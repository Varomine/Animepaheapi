const html = `<script>eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--){d[e(c)]=k[c]||e(c)}k=[function(e){return d[e]}];e=function(){return'\\\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c])}}return p}('j q=\\'1L://1K-16.1J.1I/1H/16/16/1G/1F.1E\\';',62,110,'|||player|||on|sendMessage|event||play|if|data|element||hls|video|pause|window|const|true|var|function|message|eventHandler|eventName|source|ended|currentTime|querySelector|document|ready|stop|bindEvent|attachEvent|else|addEventListener|config|Hls|new|1000|fullscreen|volume|toFixed|String|innerHTML|timestamp|ss|timeupdate|postMessage|parent|false|landscape|lock|orientation|screen|enterfullscreen|attachMedia|loadSource|lowLatencyMode|enableWorker|nudgeMaxRetry|600|maxMaxBufferLength|300|maxBufferLength|120|||maxBufferSize|90|backBufferLength|src|isSupported|iosNative|capture|airplay|pip|settings|captions|mute|time|current|progress|forward|fast|rewind|large|controls|kwik|key|storage|25|75|options|selected|speed|seekTime|ratio|global|keyboard|Plyr|m3u8|uwu|c60b6af63ddfbbb5025502c2b4b787fac406393abfeb52a488f7009ed8030c22|stream|top|owocdn|vault|https'.split('|'),0,{}))</script>`;

function unpack(p, a, c, k) {
  const e = function (c) {
    return (c < a ? '' : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36));
  };
  while (c--) {
    if (k[c]) {
      p = p.replace(new RegExp('\\\\b' + e(c) + '\\\\b', 'g'), k[c]);
    }
  }
  return p;
}

const match = html.match(/eval\(function\(p,a,c,k,e,d\).*?return p}\('(.*?)',(\d+),(\d+),'([^']+)'\.split\('\|'\)/);
if (match) {
  const p = match[1];
  const a = parseInt(match[2], 10);
  const c = parseInt(match[3], 10);
  const k = match[4].split('|');
  const unpacked = unpack(p, a, c, k);
  console.log(unpacked);
} else {
  console.log("No match");
}
