  /**
      id：getElementById 元素
      name：下载的PNG命名
    */
 saveSvgToPng(id, name) {
      const that = this;
      var doctype =
        '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" [<!ENTITY nbsp " ">]>';
      var el = document.getElementById(id).children[0].children[0];
      //  var el = document.getElementById('svg')
      if (!this.isElement(el)) {
        throw new Error("an HTMLElement or SVGElement is required; got " + el);
      }
      if (!name) {
        console.error("文件名为空!");
        return;
      }
      var xmlns = "http://www.w3.org/2000/xmlns/";
      var clone = el.cloneNode(true);
      clone.setAttribute("version", "1.1");
      if (!clone.getAttribute("xmlns")) {
        clone.setAttributeNS(xmlns, "xmlns", "http://www.w3.org/2000/svg");
      }
      if (!clone.getAttribute("xmlns:xlink")) {
        clone.setAttributeNS(
          xmlns,
          "xmlns:xlink",
          "http://www.w3.org/1999/xlink"
        );
      }
      var svg = clone.outerHTML;
      var uri =
        "data:image/svg+xml;base64," +
        window.btoa(that.reEncode(doctype + svg));
      var image = new Image();
      image.onload = function() {
        var png = that.convertToPng(image, image.width, image.height);
        var saveLink = document.createElement("a");
        var downloadSupported = "download" in saveLink;
        if (downloadSupported) {
          saveLink.download = name + ".png";
          saveLink.style.display = "none";
          document.body.appendChild(saveLink);
          try {
            var blob = that.uriToBlob(png);
            var url = URL.createObjectURL(blob);
            saveLink.href = url;
            saveLink.onclick = function() {
              requestAnimationFrame(function() {
                URL.revokeObjectURL(url);
              });
            };
          } catch (e) {
            saveLink.href = uri;
          }
          saveLink.click();
          document.body.removeChild(saveLink);
        }
      };
      image.src = uri;
    },
    convertToPng(src, w, h) {
      var canvas = document.createElement("canvas");
      var context = canvas.getContext("2d");
      canvas.width = w;
      canvas.height = h;
      context.drawImage(src, 0, 0);
      var png;
      try {
        png = canvas.toDataURL("image/png");
      } catch (e) {
        // if ((typeof SecurityError !== 'undefined' && e instanceof SecurityError) || e.name == "SecurityError") {
        //   console.error("Rendered SVG images cannot be downloaded in this browser.");
        //   return;
        // } else {
        //   throw e;
        // }
      }
      return png;
    },
    isElement(obj) {
      return obj instanceof HTMLElement || obj instanceof SVGElement;
    },
    reEncode(data) {
      data = encodeURIComponent(data);
      data = data.replace(/%([0-9A-F]{2})/g, function(match, p1) {
        var c = String.fromCharCode("0x" + p1);
        return c === "%" ? "%25" : c;
      });
      return decodeURIComponent(data);
    },
    uriToBlob(uri) {
      var byteString = window.atob(uri.split(",")[1]);
      var mimeString = uri
        .split(",")[0]
        .split(":")[1]
        .split(";")[0];
      var buffer = new ArrayBuffer(byteString.length);
      var intArray = new Uint8Array(buffer);
      for (var i = 0; i < byteString.length; i++) {
        intArray[i] = byteString.charCodeAt(i);
      }
      return new Blob([buffer], { type: mimeString });
    },
