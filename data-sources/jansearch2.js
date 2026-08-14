function JanSearch(searchUrl){
    this.BASE_URL = "https://dennou-research.com/";
    this.searchUrl = searchUrl;
}

JanSearch.prototype.search= function(query){
    let url = this.searchUrl || this.BASE_URL + "search/";

    let body = encodeURI("q=" + query)
    //url = 'https://dennou-research.com/search/?s=67340357f312a39254dc3d092d107121'
    let req = http();
    req.headers({
        "Content-Type" : "application/x-www-form-urlencoded",
        "User-Agent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
    });
    let r = req.post(url, body);
    //log(r.body);
    
    let items = r.body.match(/<article>[\s\S]*?<\/article>/g) || [];
    
    let products = items.filter(item=> item.indexOf("www.amazon.co.jp") >= 0).map(item =>{
        let n = item.match(/"\/detail\/(\d+)/);
        if (!n) log(item);
        let jan = n[1];
        let m = item.match(/<img .* src="(.*?)" alt="(.*?)"/);
        
        let product =  {
            "source" : "jan",
            "id" : jan,
            "jan" : jan,
            "title" : cleanTitle(m[2]),
            "productCode" : productCodeFromTitle(m[2]),
            "amount" : amountFromTitle(m[2]),
            "url" : this.BASE_URL + "detail/" + jan + "/",
            "thumb" : m[1],
            "image" : m[1].replace("._SL500_", ""),
        }

        // let brand = "";
        // if(/ブランド<\/span> : (.*?)<\/li>/.test(item)) brand = RegExp.$1
        // let amount = amountFromTitle(m[2]);
        
         product["desc"] = ["🅹", product.productCode, product.amount, m[2]].join(" ");
        return product
    })

    /*
    const regex = /<img .* src="(.*?)" alt="(.*?)"[\s\S]*?"\/detail\/(\d+)/g;
    let m;
    let products = [];
    while ((m = regex.exec(r.body)) !== null) {
        let product =  {
            "source" : "jan",
            "id" : m[3],
            "jan" : m[3],
            "title" : this.formatTitle(m[2]),
            "desc" : "🅹" + m[2],
            "url" : this.BASE_URL + "detail/" + m[3] + "/",
            "thumb" : m[1],
            "image" : m[1].replace("._SL500_", ""),
        }
        products.push(product);
        //console.log(`$1: ${group1}, $2: ${group2}`);
    }
    */
    return products
}

JanSearch.prototype.extra = function(jan){
    function parseProductInfo(html) {
        let productInfo = {};
      
        // 正規表現パターンを定義
        const pattern = /<li><span class="cravel-search-results-name">(.*?)<\/span> :\s(.*?)</g;
        
        let match;
        while ((match = pattern.exec(html)) !== null) {
          let key = match[1].trim();
          let value = match[2].trim();
          productInfo[key] = value;
        }
      
        return productInfo;
    }

    function parseComment(html){
        if(/<h4>商品について<\/h4>([\s\S]*?)<\/ul>/.test(html)){
            let comment =  RegExp.$1;
            comment = comment.replace(/ *<.*?> */g, "");
            return comment.trim()
        }else{
            return ""
        }
    }

    function parseImgUrl(html){
        if(/<link itemprop="image" href="(.*?)">/.test(html)){
            let image =  RegExp.$1;
            image = modifyAmazonImage(image);
            return image
        }else{
            return ""
        }        
    }

    let url = this.BASE_URL + "detail/" + jan + "/";
    let r = http().get(url);

    let product = {};
    if (r.code == 200){
        let info = parseProductInfo(r.body);
        if (!Object.keys(info).length) return product
        product.jan = jan;
        product.title = cleanTitle(info["商品名"]);
        product["ProductCode"] = info["商品モデル番号"] || info["品番"] || "";
        product["ASIN"] = info["ASIN"] || "";
        product["maker"] = info["ブランド"] || "";
        if(info["発売日"]){
            product["salesDate"] = new Date(info["発売日"]);
            product["salesDateUTC"] = product.salesDate.getTime();
        }

        product.thumb = product.image = parseImgUrl(r.body);
        product["amount"] = amountFromTitle(product.title);
        product["comment"] = parseComment(r.body);

    }

    return product

}
