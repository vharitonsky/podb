function trim(string: string): string {
  return string.replace(/^\s+|\s+$/g, "");
}

export function find(data: string, msgidToFind: string, msgctxtToFind: string) {
  //support both unix and windows newline formats.
  data = data.replace(/\r\n/g, "\n");
  var lineNo = 0;
  var lineNoStart = 0;
  var lineNoFinish = 0;
  var context = null;
  var msgid = "";
  var msgctxt = "";

  function finish() {
    if (msgid.length > 0) {
      if (msgid == msgidToFind && msgctxt == msgctxtToFind) {
        lineNoFinish = lineNo - 1;
      } else {
        msgid = "";
        msgctxt = "";
        lineNoStart = lineNo;
      }
    }
  }

  function extract(string: string) {
    string = trim(string);
    string = string.replace(/^[^"]*"|"$/g, "");
    string = string.replace(
      /\\([abtnvfr'"\\?]|([0-7]{3})|x([0-9a-fA-F]{2}))/g,
      function(match, esc, oct, hex) {
        if (oct) {
          return String.fromCharCode(parseInt(oct, 8));
        }
        if (hex) {
          return String.fromCharCode(parseInt(hex, 16));
        }
        switch (esc) {
          case "a":
            return "\x07";
          case "b":
            return "\b";
          case "t":
            return "\t";
          case "n":
            return "\n";
          case "v":
            return "\v";
          case "f":
            return "\f";
          case "r":
            return "\r";
          default:
            return esc;
        }
      }
    );
    return string;
  }
  const lines = data.split("\n");
  while (lines.length > 0) {
    var line = trim(<string>lines.shift());
    lineNo += 1;
    if (line.match(/^#:/)) {
      // Reference
      finish();
    } else if (line.match(/^#,/)) {
      // Flags
      finish();
    } else if (line.match(/^#($|\s+)/)) {
      // Translator comment
      finish();
    } else if (line.match(/^#\./)) {
      // Extracted comment
      finish();
    } else if (line.match(/^msgid_plural/)) {
      // Plural form
      context = "msgid_plural";
    } else if (line.match(/^msgid/)) {
      // Original
      finish();
      msgid = extract(line);
      context = "msgid";
    } else if (line.match(/^msgstr/)) {
      // Translation
      if (msgid == "") {
        // Header hack-fix
        msgid = "___________________dummy";
      }
      context = "msgstr";
    } else if (line.match(/^msgctxt/)) {
      // Context
      finish();
      msgctxt = extract(line);
      context = "msgctxt";
    } else {
      // Probably multiline string or blank
      if (line.length > 0) {
        if (context === "msgid") {
          msgid += extract(line);
        } else if (context === "msgctxt") {
          msgctxt += extract(line);
        }
      }
    }
    if (lineNoFinish) {
      return [lineNoStart, lineNoFinish];
    }
  }
  finish();
  return [-1, -1];
}
