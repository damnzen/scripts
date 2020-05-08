function OpenBD() {
}

OpenBD.prototype.convertDate = function(datestr) {
	 var d = new Date(datestr.substr(0,4), datestr.substr(4,2),datestr.substr(6,2));
	return d.getTime();
}

OpenBD.prototype.lookup = function(isbn) {
	var url = "https://api.openbd.jp/v1/get?isbn=" + isbn + "&pretty";
	var req = http();
	var res = req.get(url);
	var json = JSON.parse(res.body);

	var o = json[0]["onix"];
	o["title"] = o["DescriptiveDetail"]["TitleDetail"]["TitleElement"]["TitleText"]["content"];
	o["author"] = o["DescriptiveDetail"]["Contributor"].map(e => e["PersonName"]["content"]).join(", ");
	o["publisher"] = o["PublishingDetail"]["Imprint"].ImprintName;
	o["publishedDate"] = this.convertDate(o["PublishingDetail"].PublishingDate[0]["Date"]);
	o["pageCount"] = o["DescriptiveDetail"].Extent[0].ExtentValue;
	o["description"] = o["CollateralDetail"].TextContent[0].Text;
	o["isbn"] = o.RecordReference;
	if("SupportingResource" in o["CollateralDetail"]) o["image"] = o["CollateralDetail"].SupportingResource[0].ResourceVersion[0].ResourceLink;
	if("Subject" in o["DescriptiveDetail"]){
		var ccode = o["DescriptiveDetail"].Subject[0].SubjectCode;
		var r = BookUtil.convertCcode(ccode);
		Object.assign(o,r);
	}
	return o;
}
