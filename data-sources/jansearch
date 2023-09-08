function JanSearch(){
    this.BASE_URL = "https://www.jancode.xyz";
}

JanSearch.prototype.search= function(query){
    let url = this.BASE_URL + "/word/?q=" + encodeURIComponent(query);
    let r = http().get(url);
    let items = r.body.match(/<h4 class="title">JANコード:[\s\S]*?<\/p>/g);
    if (items.length){
        let res = items.map(item => {
            let m = item.match(/<h4 class="title">JANコード:(\d+)<\/h4>[\s\S]*?<img src="([^"]*)".*?>\s*(.*?)\s*<\/p>/);
            return {
                "id" : m[1],
                "jan" : m[1],
                "title" : m[3],
                "url" : this.BASE_URL + "/" + m[1] + "/",
                "thumb" : this.BASE_URL + m[2],
                "image" : this.BASE_URL + m[2].replace("/item/", "/item/d/")
            }
        })
        return res
    }
    
}

JanSearch.prototype.extra = function(jan){
    function removeTags(str){
        return str.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'')
    }
      
    function getTableVal(b, key, html){
        let re = new RegExp("<th>" + key + "</th>\\s*<td>(.*?)</td>")
        let m = b.match(re);
        if (m){
            if (html){
                return m[1];
            }else{
                return removeTags(m[1]);
            }
        }else{
            return ""
        }
    }

    function parseHTMLTable(html) {
        const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/g; // テーブルの正規表現
        const rowRegex = /<tr[^>]*>[\s\S]*?<\/tr>/g; // 行の正規表現
        const cellRegex = /<(th|td)[^>]*>(.*?)<\/(th|td)>/g; // セルの正規表現
      
        //const result = {};
        const result = [];

        const tableMatches = html.match(tableRegex); // テーブルを抽出
        if (!tableMatches) {
          //throw new Error('テーブルが見つかりませんでした。');
          return null
        }
      
        tableMatches.forEach(tableMatch => {
          const rowMatches = tableMatch.match(rowRegex); // 行を抽出
          if (!rowMatches) return;
      
          rowMatches.forEach(rowMatch => {
            const cellMatches = rowMatch.match(cellRegex); // セルを抽出
            if (cellMatches && cellMatches.length === 2) {
              const key = cellMatches[0].replace(/<\/?(th|td)[^>]*>/g, '').trim();
              const value = cellMatches[1].replace(/<\/?(th|td)[^>]*>/g, '').trim();
              if (key == "広告") return;
              //result[key] = value;
              result.push(key + " : " + value);
            }
          });
        });
      
        return result;
    }

    function parseJapaneseDateString(dateString) {
        if (!dateString) return null;
        const dateArray = dateString.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
      
        if (dateArray) {
          const year = parseInt(dateArray[1]);
          const month = parseInt(dateArray[2]) - 1; // 月は0から始まるため、1を引きます
          const day = parseInt(dateArray[3]);
      
          return new Date(year, month, day);
        } else {
          return null
        }
    }

    let url = this.BASE_URL + "/" + jan + "/";
    let r = http().get(url);

    let res = {
        "title" : getTableVal(r.body, "商品名"),
        "jan" : jan,
        "maker" : getTableVal(r.body, "会社名"),
        "productcode" : getTableVal(r.body, "品番/型番"),
        "saledate" : parseJapaneseDateString(getTableVal(r.body, "発売日")),
        "category" : getTableVal(r.body, "商品ジャンル").split(" &gt ")
    }
    let img = getTableVal(r.body, "商品イメージ", true);
    if (img && /src="(.*?)"/.test(img)){
        res["image"] = this.BASE_URL + RegExp.$1;
    }

    if(/<h3>商品詳細情報<\/h3>[\s\S]*<\/table>/.test(r.body)){
        let table = RegExp.lastMatch;
        let spec = parseHTMLTable(table);
        res["spec"] = spec.join("\n");
        let amount = getTableVal(table, "内容量");
        if (!amount) amount = amountFromTitle(res.title);
        res["amount"] = amount;
    }
    return res
}
