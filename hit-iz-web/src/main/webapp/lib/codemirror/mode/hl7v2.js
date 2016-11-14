/**
 * edi.js
 * 
 * Building upon and improving the CodeMirror 2 XML parser
 * @author: Harold AFFO
 * @date: 31 July, 2012
 */

CodeMirror.defineMode("hl7v2", function(config, parserConfig) {

//            var tab = [ '|', '^', '&', '~' ];
//            var separators = new Array(4);
//            separators['field_separator'] = tab[0];
//            separators['component_separator'] = tab[1];
//            separators['subcomponent_separator'] = tab[2];
//            separators['continuation_separator'] = tab[3];
			return {
			    token: function(stream,state) {
			      var ch = stream.next();
			      if(stream.column() <= 2){
 			    	  return "segment-name";
			      }else{
			     	  if(parserConfig.separators != null){
			    		  if(ch == parserConfig.separators.field_separator){
			    			  return "field-separator";
			    		  }
			    		  if(ch == parserConfig.separators.component_separator){
			    			  return "component-separator";
			    		  }
			    		  if(ch == parserConfig.separators.subcomponent_separator){
			    			  return "subcomponent-separator";
			    		  }
			    		  if(ch == parserConfig.separators.continuation_separator){
			    			  return "continuation-separator";
			    		  }
			    	  }else{
			    		  return "";
			    	  }
			      }
 			      } 
			 };
});

CodeMirror.defineMIME("text/hl7v2", "hl7v2");
