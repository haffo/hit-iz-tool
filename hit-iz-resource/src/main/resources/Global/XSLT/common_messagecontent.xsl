<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xi="http://www.w3.org/2001/XInclude" xmlns:util="http://hl7.nist.gov/data-specs/util" xpath-default-namespace="" exclude-result-prefixes="xs" version="2.0">


	<!-- param: output   values: json | jquery-tab-html | ng-tab-html    default: plain-html -->
	<!--xsl:param name="output" select="'json'" /-->
	<!--xsl:param name="output" select="'jquery-tab-html'" -->
	<!--xsl:param name="output" select="'plain-html'"/-->
	<xsl:param name="output" select="'ng-tab-html'"/>
	<xsl:variable name="version" select="'1.0'"/>
	<!-- Release notes author: sriniadhi.work@gmail.com


	-->


	<!-- character map is used for being able to output these special html entities directly after escaping -->
	<xsl:character-map name="tags">
		<xsl:output-character character="&lt;" string="&lt;"/>
		<xsl:output-character character="&gt;" string="&gt;"/>
	</xsl:character-map>
	<xsl:output method="html" use-character-maps="tags"/>
	
	<xsl:variable name="generate-plain-html" select="$output = 'plain-html' or $output = 'ng-tab-html'"/>
	<!--  Use this section for supportd profiles -->
	<xsl:variable name="VXU" select="'VXU'"/>
	<xsl:variable name="QBP" select="'QBP'"/>
	<xsl:variable name="ACK" select="'ACK'"/>
	<xsl:variable name="SS" select="'SS'"/>
	
	
	<!--  This is the example format for the JSON output -->
	<!-- Example format: { "tables": [ { "title": "Patient Information", "elements": 
		[ { "element" : "Patient Name", "data" : "Madelynn Ainsley" }, { "element" 
		: "Mother's Maiden Name", "data" : "Morgan" }, { "element" : "ID Number", 
		"data" : "A26376273 D26376273 " }, { "element" : "Date/Time of Birth", "data" 
		: "07/02/2015" }, ... ] }, ] } -->
		
		
	<!--  ROOT TEMPLATE. Call corresponding sub templates based on the output desired (parametrized) -->
	<xsl:template match="*">
		<xsl:choose>
			<xsl:when test="$output = 'json'">
				<xsl:call-template name="main"/>
			</xsl:when>
			<xsl:when test="$output = 'plain-html'">
				<xsl:call-template name="plain-html"/>
			</xsl:when>
			<xsl:when test="$output = 'ng-tab-html'">
				<xsl:call-template name="ng-tab-html"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:call-template name="main-html"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<!-- This generates the structured DATA (json if output is 'json' and html if it is 'plain-html'. Note that the main-html/jquery-tab-html call this in return -->
	<xsl:template name="main">
		<!-- Add profile information if it is json -->
		<xsl:value-of select="util:start(name(.), 'message-content')"/>
		 <xsl:for-each-group select="Segment" group-by="@Name">
					 <xsl:variable name="multiple-segs" as="xs:boolean">
						 <xsl:value-of select="count(current-group()) &gt; 1"/>
					 </xsl:variable>					
					<xsl:if test="$multiple-segs">
						<xsl:value-of select="util:title('title', concat(@Name, '[*]'),  concat(@Name, '[*]'), $ind1, false(), false())"/>
						<xsl:value-of select="util:tag('accordion', '')"/> 
					</xsl:if>
					<xsl:for-each select="current-group()">
						<xsl:variable name="index">
							<xsl:if test="$multiple-segs">
								<xsl:value-of select="concat(' - ', position())"/>
							</xsl:if>
						</xsl:variable>
						
						<xsl:apply-templates select=".">
							<xsl:with-param name="vertical-orientation" as="xs:boolean" select="$multiple-segs"/>
							<xsl:with-param name="counter" select="$index"/>
						</xsl:apply-templates>
					</xsl:for-each>
					<xsl:if test="$multiple-segs">
						<xsl:value-of select="util:tag('/accordion', '')"/> 
						<xsl:value-of select="util:end-tab($ind1, true())"/>
					</xsl:if>
		 </xsl:for-each-group>
		<xsl:value-of select="util:end($ind1)"/>
	</xsl:template>
	<!-- Indentation values so that the output is readable -->
	<xsl:variable name="ind1" select="'&#x9;&#x9;'"/>
	<xsl:variable name="ind2" select="'&#x9;&#x9;&#x9;&#x9;&#x9;'"/>
	<xsl:variable name="ind3" select="'&#x9;&#x9;&#x9;&#x9;&#x9;&#x9;&#x9;'"/>

	<!-- - - - - - Patient information - - - - - - - - - - - -->
	<xsl:template match="Segment">
		<xsl:param name="vertical-orientation" as="xs:boolean" select="false()"/>
		<xsl:param name="counter" select="''"/>
		<xsl:value-of select="util:title('title', concat(@Name, $counter), concat(@Name, ' : ', @Description), $ind1, false(), $vertical-orientation)"/>
		<xsl:value-of select="util:message-elements($ind1)"/>
		<xsl:apply-templates select="Field"/>
		<xsl:value-of select="util:end-elements($ind1, $vertical-orientation)"/>
	</xsl:template>
	
	<xsl:template match="Field">
		<xsl:value-of select="util:message-element-with-delimiter(./@Location, ./@DataElement, ./@Data, ./@Categrization, ',', $ind1, 'Field')"/>
		<xsl:apply-templates select="Component"/>
	</xsl:template>

	<xsl:template match="Component">
		<xsl:value-of select="util:message-element-with-delimiter(./@Location, ./@DataElement, ./@Data, ./@Categrization, ',', $ind2, 'Component')"/>
		<xsl:apply-templates select="SubComponent"/>
	</xsl:template>

	<xsl:template match="SubComponent">
		<xsl:value-of select="util:message-element-with-delimiter(./@Location, ./@DataElement, ./@Data, ./@Categrization, ',', $ind3, 'SubComponent')"/>
	</xsl:template>

	
	<xsl:template xmlns:fo="http://www.w3.org/1999/XSL/Format" name="plain-html">
		<html xmlns="">
			<head>				
				<xsl:call-template name="css"/>
			</head>
		<body>
			<xsl:call-template name="main"/>
		</body>
		</html>
	</xsl:template>
	<xsl:template xmlns:fo="http://www.w3.org/1999/XSL/Format" name="ng-tab-html">
		<xsl:call-template name="css"/>
		<xsl:call-template name="main"/>
	</xsl:template>
	<xsl:template xmlns:fo="http://www.w3.org/1999/XSL/Format" name="main-html">
		<html xmlns="">
			<head>
			<xsl:if test="$output = 'jquery-tab-html'">
				<link rel="stylesheet" href="http://code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css"/>
				<script src="http://code.jquery.com/jquery-1.10.2.js"/>
				<script src="http://code.jquery.com/ui/1.11.4/jquery-ui.js"/>
			</xsl:if>

			<xsl:call-template name="css"/>
				
			<script>
				var data = 
				<xsl:call-template name="main"/>;
				
				var full = '', html = '';
				
				<xsl:if test="$output = 'jquery-tab-html'">
					$(function() { $( "#test-data-tabs" ).tabs();	});
				</xsl:if>
				
				document.write('<div class="test-data-specs-main">');
					
				/* if we wanted to generate the root tab structure include this code
				$(function() { $( "#test-tabs" ).tabs();	});
					
				document.write('<div id="test-tabs">');
				document.write('<ul>');
				document.write('<li>
									<a href="#test-tabs-0">Test Story</a>
								</li>');
				document.write('<li>
									<a href="#test-tabs-1">Test Data Specification</a>
								</li>');
				document.write('<li>
									<a href="#test-tabs-2">Message Content</a>
								</li>');
				document.write('</ul>'); 
				*/
				
				<!-- xsl:call-template name="test-story"></xsl:call-template -->
				<xsl:call-template name="test-data-specs"/>
				<!-- xsl:call-template name="message-content"></xsl:call-template -->
					
				document.write('</div>');	
				document.write('</div>');	
			</script>
			</head>
			<body>
			</body>
		</html>								
	</xsl:template><xsl:template xmlns:fo="http://www.w3.org/1999/XSL/Format" name="test-story">
		document.write('<div xmlns="" id="test-tabs-0">');
		document.write(' ............. Test .......... Story................... ');
		document.write('</div>');
	</xsl:template><xsl:template xmlns:fo="http://www.w3.org/1999/XSL/Format" name="message-content">
		document.write('<div xmlns="" id="test-tabs-2">');
		document.write(' ............. Message .......... Content................... ');
		document.write('</div>');
	</xsl:template><xsl:template xmlns:fo="http://www.w3.org/1999/XSL/Format" name="test-data-specs">
		
		<!-- if jquery-tab-html create full div and a div for each tab; otherwise generate only the FULL div containing all the tables -->
		document.write('<div xmlns="" id="test-tabs-1">');
		document.write('<div id="test-data-tabs">');
			<xsl:if test="$output = 'jquery-tab-html'">
				document.write('<ul>');
				document.write('<li>
							<a href="#test-data-tabs-0">FULL</a>
						</li>');
				for(var key in data.tables) {
					document.write('<li>
							<a href="#test-data-tabs-' + (key+1) + '">' + data.tables[key].title + '</a>
						</li>');
				}	
				document.write('</ul>');
			</xsl:if>
		
			<!-- each table is under a div test-data-tabs-nn -->
			for(var key in data.tables) {
			    var tab = '';
			    tab += '<div id="test-data-tabs-' + (key+1) + '">';
				var table = data.tables[key];
				tab += ('<fieldset>
						<legend>' + table.title + 
					'</legend> <table> <tr> <th> Element </th> <th> Data </th> </tr>'); 

				for (var elkey in table.elements) {
					element = table.elements[elkey];
					// display obxs as separate table
					if (element.element == 'obx') {
							var obx = element.data;
							tab += '</table></fieldset>'; // end the bigger table
							tab += ('<fieldset>
						<table> <tr> <th colspan="2"> ' + obx.title + '</th> </tr>'); 
							for (var obxkey in obx.elements) {
								if (obx.elements[obxkey].element == "") { // gray line
									tab += '<tr class="obxGrpSpl">
								<td colspan="2"/>
							</tr>';
								} 						
								else {
									tab += ('<tr>
								<td>' + obx.elements[obxkey].element + '</td>
								<td>' + obx.elements[obxkey].data + '</td>
							</tr>');
								}
							}
					}
					else {
						var tdclass = element.data == '' ? "noData" : "data"; 
						tab += ('<tr>
								<td>' + element.element + '</td>
								<td class="' + tdclass + '">' + element.data + '</td>
							</tr>');
					}
				}
				
				tab += '</table>
					</fieldset>';
				tab += '</div>';

				<!-- output individual tabs only if the output is jquery-tab-html; otherwise collect all of them and output only once -->
				<xsl:if test="$output = 'jquery-tab-html'">
					document.write(tab);
				</xsl:if>
				
				<!-- full tab is nothing but sum of all other tabs -->
				full += tab; 
			} 					
			
			<!-- full tab: test-data-tabs-0 div -->
			document.write('<div id="test-data-tabs-0"> ' + full + '</div>');
			document.write('</div>');
			document.write('</div>'); 
	</xsl:template>
	<xsl:template xmlns:fo="http://www.w3.org/1999/XSL/Format" name="css">
		<style xmlns="" type="text/css">
                     @media screen {
					.message-content fieldset {text-align:center;}
                    .message-content maskByMediaType {display:table;}
					.message-content table tbody tr th {font-size:100%}
					.message-content table tbody tr td {font-size:90%;}
					.message-content table tbody tr th {text-align:left;background:#436BEC}
					.message-content table thead tr th {text-align:center;}
					.message-content table thead tr th:first-child {width:15%;}
					.message-content table thead tr th:nth-child(2) {width:30%;}
					.message-content table thead tr th:nth-child(3) {width:30%;}
					.message-content table thead tr th:last-child {width:20%;}
					.message-content table { width:98%;border: 1px groove;table-layout: fixed; margin:0 auto;border-collapse: collapse;}
					.message-content table  tr { border: 3px groove; }
					.message-content table  th { border: 2px groove;}
					.message-content table  td { border: 2px groove; }
					.message-content table thead {border: 1px groove;background:#436BEC;text-align:left;}
					.message-content table tbody tr td {text-align:left}
					.message-content  .Field  { font: bold; background-color: rgb(198, 222, 255); }
					.message-content  td.Component {padding-left:15px;}
					.message-content  td.SubComponent {padding-left:25px;}
					.message-content  td.noData {background:#B8B8B8;}
					.message-content  .Field .noData {background:rgb(198, 222, 255);}
                    }
                    @media print {
					.message-content  {text-align:center;page-break-inside: avoid;}
                    .message-content maskByMediaType {display:table;}
                    .message-content  table tbody tr th {font-size:80%}
                    .message-content  table tbody tr td {font-size:70%;}
                    .message-content  table tbody tr th {text-align:left;background:#436BEC}
                    .message-content  table thead tr th {text-align:center;font-size:80%;}
                    .message-content  legend {text-align:center;font-size:70%;}
                    .message-content  table thead tr th:first-child {width:15%;}
                    .message-content  table thead tr th:nth-child(2) {width:30%;}
                    .message-content  table thead tr th:nth-child(3) {width:30%;}
                    .message-content  table thead tr th:last-child {width:20%;}
					.message-content  table { width:98%;border: 1px groove;table-layout: fixed; margin:0 auto;border-collapse: collapse;page-break-inside: avoid;}
                    .message-content  table  tr { border: 3px groove; }
                    .message-content  table  th { border: 2px groove;}
                    .message-content  table  td { border: 2px groove; }
                    .message-content  table thead {border: 1px groove;background:#436BEC;text-align:left;}
                    .message-content  table tbody tr td {text-align:left}
					.message-content  .Field  { font: bold; background-color: rgb(198, 222, 255); }
                    .message-content  .Component {padding-left:10px;}
                    .message-content  .SubComponent {padding-left:20px;}
                    .message-content td.noData {background:#B8B8B8;}
					.message-content  td.noData {background:rgb(198, 222, 255);;}
                    }
                    @page {
                    counter-increment: page;
					@bottom-center {
                    content: "Page " counter(page);
                    }
                    }
                    @page :left {
                    margin-left: 5%;
                    margin-right: 5%;
                    }
                    @page :right {
                    margin-left: 5%;
                    margin-right: 5%;
                    }
		</style>
	</xsl:template>
	<xsl:function name="util:format-trailing">
		<xsl:param name="value"/>
		<xsl:param name="padding"/>
		<xsl:value-of select="$value"/>
		<xsl:if test="$value != ''">
			<xsl:value-of select="$padding"/>
		</xsl:if>
	</xsl:function><xsl:function name="util:format-with-space">
		<xsl:param name="value"/>
		<xsl:value-of select="util:format-trailing($value, ' ')"/>
	</xsl:function><xsl:function name="util:format-tel">
		<xsl:param name="areacode"/>
		<xsl:param name="phonenumberin"/>
		<!-- pad it so that length problems don't happen -->
		<xsl:variable name="phonenumber" select="concat($phonenumberin, '                ')"/>
		<xsl:if test="$areacode != '' and $phonenumber != ''">
			<xsl:variable name="areaCode" select="concat('(',$areacode,')')"/>
			<xsl:variable name="localCode" select="concat(substring($phonenumber,1,3),'-')"/>
			<xsl:variable name="idCode" select="substring($phonenumber,4,4)"/>
			<xsl:value-of select="concat($areaCode,$localCode,$idCode)"/>
		</xsl:if>
	</xsl:function><xsl:function name="util:format-address">
		<xsl:param name="street"/>
		<xsl:param name="city"/>
		<xsl:param name="state"/>
		<xsl:param name="zip"/>
		<xsl:param name="country"/>

		<xsl:value-of select="concat(util:format-with-space($street), util:format-with-space($city), util:format-with-space($state), util:format-with-space($zip), util:format-with-space($country))"/>

	</xsl:function><xsl:function name="util:tags">
		<xsl:param name="tag"/>		
		<xsl:param name="content"/>		
		<xsl:param name="ind"/>
		
		<xsl:value-of select="concat($nl, $ind)"/>
		<xsl:text disable-output-escaping="yes">&lt;</xsl:text>
		<xsl:value-of select="$tag"/>
		<xsl:text disable-output-escaping="yes">&gt;</xsl:text>	
		
		<xsl:value-of select="$content"/>
		
		<xsl:text disable-output-escaping="yes">&lt;/</xsl:text>
		<xsl:value-of select="$tag"/>
		<xsl:text disable-output-escaping="yes">&gt;</xsl:text>		
	</xsl:function><xsl:function name="util:tag">
		<xsl:param name="tag"/>		
		<xsl:param name="ind"/>
		
		<xsl:value-of select="concat($nl, $ind)"/>
		<xsl:text disable-output-escaping="yes">&lt;</xsl:text>
		<xsl:value-of select="$tag"/>
		<xsl:text disable-output-escaping="yes">&gt;</xsl:text>	
		
	</xsl:function><xsl:function name="util:format-date">
		<xsl:param name="elementDataIn"/>
		<!-- pad it so that length problems don't happen -->
		<xsl:variable name="elementData" select="concat($elementDataIn, '                ')"/>
		<xsl:if test="string-length(normalize-space($elementData)) &gt; 0">
			<xsl:variable name="year" select="substring($elementData,1,4)"/>
			<xsl:variable name="month" select="concat(substring($elementData,5,2),'/')"/>
			<xsl:variable name="day" select="concat(substring($elementData,7,2),'/')"/>
			<xsl:value-of select="concat($month,$day,$year)"/>
			<!-- <xsl:value-of select="format-date(xs:date(concat($month,$day,$year)),'[D1o] 
				[MNn], [Y]', 'en', (), ())"/> -->
		</xsl:if>
	</xsl:function><xsl:function name="util:start">
		<xsl:param name="profile"/>
		<xsl:param name="div"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">				
				<!-- output version number and profile info at the start with the comment -->
				<xsl:variable name="comment-string">
						<xsl:value-of select="'!-- generated by common_tdspec.xslt Version:'"/>
						<xsl:value-of select="$version"/>
						<xsl:value-of select="'   Profile:'"/>
						<xsl:value-of select="$profile"/>
						<xsl:value-of select="'--'"/>
				</xsl:variable>
				<xsl:value-of select="util:tag($comment-string, '')"/>
				<xsl:value-of select="util:tag(concat('div class=&quot;',  $div, '&quot;'), '')"/>
				
				<!-- generate tabset outer block for angular -->
				<xsl:if test="$output = 'ng-tab-html'">
							<xsl:value-of select="util:tag('tabset', '')"/> 
				</xsl:if> 
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat('{', $nl, '&quot;version&quot; : &quot;', $version, '&quot;,', $nl, '&quot;profile&quot; : &quot;', $profile, '&quot;,', $nl, '&quot;tables&quot;:', $nl, '[', $nl)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function name="util:begin-obx-table">
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">				
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($nl, $ind, '{&quot;element&quot; : &quot;obx&quot;, &quot;data&quot; : ', $nl)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function name="util:end-obx-group">
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">
				<xsl:value-of select="util:tag('tr class=''obxGrpSpl''', $ind)"/>
				<xsl:value-of select="util:tag('td colspan=''2''', $ind)"/>
				<xsl:value-of select="util:tag('/td', $ind)"/>
				<xsl:value-of select="util:tag('/tr', $ind)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="util:element('', '', $ind)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:variable name="indent" select="'&#x9;'"/><xsl:variable name="nl" select="'&#xA;'"/><xsl:function name="util:title">
		<xsl:param name="name"/>
		<xsl:param name="tabname"/>
		<xsl:param name="value"/>
		<xsl:param name="ind"/>
		<xsl:param name="endprevioustable" as="xs:boolean"/>
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		
		<xsl:variable name="prelude">
			<xsl:choose>
				<xsl:when test="$endprevioustable">
					<xsl:choose>
						<xsl:when test="$generate-plain-html">
							<xsl:value-of select="util:tag('/table', $ind)"/>
							<xsl:value-of select="util:tag('br/', $ind)"/>
							<xsl:value-of select="util:end-tab($ind, false())"/>
							<xsl:value-of select="util:tag('br/', $ind)"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="concat($ind, '},', $nl)"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:when>
				<xsl:otherwise>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">
				<xsl:value-of select="util:begin-tab($tabname, $value, '', $vertical-orientation)"/>
			 </xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($prelude, $ind, '{', $nl, $ind, $indent, '&quot;', $name, '&quot;', ':', '&quot;', $value, '&quot;,', $nl)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function name="util:title-no-tab">
		<xsl:param name="name"/>
		<xsl:param name="tabname"/>
		<xsl:param name="value"/>
		<xsl:param name="ind"/>
		<xsl:param name="endprevioustable" as="xs:boolean"/>
		
		<xsl:choose>
			<xsl:when test="$output = 'ng-tab-html'">
					<xsl:value-of select="util:tag('fieldset', $ind)"/>
					<xsl:value-of select="util:tags('legend', $value, $ind)"/>
			</xsl:when>
			<xsl:otherwise>
					<xsl:value-of select="util:title($name, $tabname, $value, $ind, $endprevioustable, false())"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function name="util:begin-tab">
		<xsl:param name="tabname"/>
		<xsl:param name="val"/>
		<xsl:param name="ind"/>
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:choose>
			<xsl:when test="$output = 'ng-tab-html'">
				<xsl:value-of select="util:tag(concat(util:IfThenElse($vertical-orientation, 'accordion-group type=&quot;pills&quot;', 'tab'), ' heading=&quot;', $tabname, '&quot; vertical=&quot;', $vertical-orientation, '&quot;'), '')"/>
				<xsl:value-of select="util:tag('fieldset', $ind)"/>
				<xsl:value-of select="util:tags('legend', $val, $ind)"/>
			</xsl:when>
			<xsl:when test="$output = 'plain-html'"> 
				<xsl:value-of select="util:tag('fieldset', $ind)"/>
					<xsl:value-of select="util:tags('legend', $val, $ind)"/>
			</xsl:when>
		</xsl:choose>
	</xsl:function><xsl:function name="util:end-tab">
		<xsl:param name="ind"/>
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:choose>
			<xsl:when test="$output = 'ng-tab-html'">
				<xsl:value-of select="util:tag('/fieldset', '')"/>
				<xsl:value-of select="util:tag(util:IfThenElse($vertical-orientation, '/accordion-group', '/tab'), '')"/>
			</xsl:when>
			<xsl:when test="$output = 'plain-html'">
				<xsl:value-of select="util:tag('/fieldset', '')"/>
			</xsl:when>
		</xsl:choose>
	</xsl:function><xsl:function name="util:elements">
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">				
				<xsl:value-of select="util:tag('table', $ind)"/>	
				<xsl:value-of select="util:tag('tr', $ind)"/>
				<xsl:value-of select="util:tags('th', 'Element', $ind)"/>
				<xsl:value-of select="util:tags('th', 'Data', $ind)"/>
				<xsl:value-of select="util:tag('/tr', $ind)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($ind, $indent, '&quot;elements&quot; : ', $nl, $ind, $indent, '[')"/> 
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function name="util:message-elements">
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">				
				<xsl:value-of select="util:tag('table', $ind)"/>	
				<xsl:value-of select="util:tag('tr', $ind)"/>
				<xsl:value-of select="util:tags('th', 'Location', $ind)"/>
				<xsl:value-of select="util:tags('th', 'Data Element', $ind)"/>
				<xsl:value-of select="util:tags('th', 'Data', $ind)"/>
				<xsl:value-of select="util:tags('th', 'Categorization', $ind)"/>
				<xsl:value-of select="util:tag('/tr', $ind)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($ind, $indent, '&quot;elements&quot; : ', $nl, $ind, $indent, '[')"/> 
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function name="util:end-obx-elements">
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">	
				<xsl:variable name="end-elements">
					<xsl:value-of select="util:tag('/table', $ind)"/>
					<xsl:value-of select="util:tag('br/', $ind)"/>
					<xsl:value-of select="util:tag('/fieldset', $ind)"/>
					<xsl:value-of select="util:tag('/table', $ind)"/>
					<xsl:value-of select="util:end-tab($ind, false())"/>
					<xsl:value-of select="util:tag('br/', $ind)"/>
				</xsl:variable>
				<xsl:value-of select="$end-elements"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($ind, ']', $nl)"/> 
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function name="util:end-elements">
		<xsl:param name="ind"/>
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">	
				<xsl:variable name="end-elements">
					<xsl:value-of select="util:tag('/table', $ind)"/>
					<xsl:value-of select="util:tag('br/', $ind)"/>
					<xsl:value-of select="util:end-tab($ind, $vertical-orientation)"/>
					</xsl:variable>
				<xsl:value-of select="$end-elements"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($ind, ']', $nl)"/> 
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function name="util:element">
		<xsl:param name="name"/>
		<xsl:param name="value"/>
		<xsl:param name="ind"/>
		<xsl:value-of select="util:element-with-delimiter($name, $value, ',', $ind)"/>
	</xsl:function><xsl:function name="util:last-element">
		<xsl:param name="name"/>
		<xsl:param name="value"/>
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">				
				<xsl:value-of select="util:element-with-delimiter($name, $value, '', $ind)"/>
				<xsl:value-of select="util:tag('/table', $ind)"/>
				<xsl:value-of select="util:end-tab($ind, false())"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat(util:element-with-delimiter($name, $value, '', $ind), $nl, $ind, $indent, ']', $nl)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function name="util:end-table">
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">				
				<xsl:value-of select="util:tag('/table', $ind)"/>
				<xsl:value-of select="util:tag('/br', $ind)"/>
			</xsl:when>
			<xsl:otherwise>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function name="util:single-element">
		<xsl:param name="name"/>
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">
				<xsl:variable name="td-element">
					<xsl:value-of select="util:tag('td colspan=&quot;2&quot;', $ind)"/>							
					<xsl:value-of select="$name"/>							
					<xsl:value-of select="util:tag('/td',$ind)"/>							
				</xsl:variable>
				<xsl:value-of select="util:tags('tr', $td-element, $ind)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="util:element-with-delimiter($name, '', ',', $ind)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function name="util:element-with-delimiter">
		<xsl:param name="name"/>
		<xsl:param name="value"/>
		<xsl:param name="trailing"/>
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">
				<xsl:variable name="td-element">
					<xsl:value-of select="util:tags('td', $name, $ind)"/> 
					<xsl:choose>
						<xsl:when test="normalize-space($value) = ''">
							<xsl:value-of select="util:tag('td class=''noData''', $ind)"/>							
							<xsl:value-of select="$value"/>							
							<xsl:value-of select="util:tag('/td', $ind)"/>							
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="util:tags('td', $value, $ind)"/>							
						</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<xsl:value-of select="util:tags('tr', $td-element, $ind)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($nl, $ind, $indent, $indent, '{&quot;element&quot; : &quot;', $name, '&quot;, &quot;data&quot; : &quot;', $value, '&quot;}', $trailing)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function name="util:message-element-with-delimiter">
		<xsl:param name="location"/>
		<xsl:param name="dataelement"/>
		<xsl:param name="data"/>
		<xsl:param name="categorization"/>
		<xsl:param name="trailing"/>
		<xsl:param name="ind"/>
		<xsl:param name="item-hierarchy"/>
		
		<xsl:choose>
			<xsl:when test="$generate-plain-html">
				<xsl:variable name="td-element">
					<xsl:value-of select="util:tag(concat('td class=&quot;', $item-hierarchy, '&quot;'), $ind)"/>							
					<xsl:value-of select="$location"/>							
					<xsl:value-of select="util:tag('/td', $ind)"/>							
					<xsl:value-of select="util:tag(concat('td class=&quot;', $item-hierarchy, '&quot;'), $ind)"/>							
					<xsl:value-of select="$dataelement"/>							
					<xsl:value-of select="util:tag('/td', $ind)"/>							
					<xsl:value-of select="util:tag(concat('td class=&quot;', util:IfEmptyThenElse($data, 'noData', 'Data'), '&quot;'), $ind)"/>							
					<xsl:value-of select="$data"/>							
					<xsl:value-of select="util:tag('/td', $ind)"/>							
						<xsl:value-of select="util:tag(concat('td class=&quot;', util:IfEmptyThenElse($categorization, 'noData', 'Data'), '&quot;'), $ind)"/>							
						<xsl:value-of select="$categorization"/>							
						<xsl:value-of select="util:tag('/td', $ind)"/>							
				</xsl:variable>
				<xsl:value-of select="util:tags('tr', $td-element, $ind)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($nl, $ind, $indent, $indent,         '{&quot;location&quot; : &quot;', $location, '&quot;, &quot;dataelement&quot; : &quot;', $dataelement, '&quot;, &quot;data&quot; : &quot;', $data, '&quot;, &quot;categorization&quot; : &quot;', $categorization, '&quot;}', $trailing)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function name="util:end">
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">	
				<xsl:if test="$output = 'ng-tab-html'">
					<xsl:value-of select="util:tag('/tabset', '')"/>
				</xsl:if>
				<xsl:value-of select="util:tag('/div', $ind)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($nl, $ind, '}', $nl, ']', $nl, '}')"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function name="util:blank-if-1">
		<xsl:param name="pos"/>
		<xsl:choose>
			<xsl:when test="$pos = 1">	
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$pos - 1"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function name="util:action-code">
		<xsl:param name="code"/>
		<xsl:choose>
			<xsl:when test="$code = 'A'">	
					<xsl:value-of select="'Add'"/>
			</xsl:when>
			<xsl:when test="$code = 'D'">	
					<xsl:value-of select="'Delete'"/>
			</xsl:when>
			<xsl:when test="$code = 'U'">	
					<xsl:value-of select="'Update'"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$code"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function name="util:admin-sex">
		<xsl:param name="code"/>
		<xsl:choose>
			<xsl:when test="$code = 'F'">	
					<xsl:value-of select="'Female'"/>
			</xsl:when>
			<xsl:when test="$code = 'M'">	
					<xsl:value-of select="'Male'"/>
			</xsl:when>
			<xsl:when test="$code = 'U'">	
					<xsl:value-of select="'Unknown/undifferentiated'"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$code"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function name="util:protection-indicator">
		<xsl:param name="code"/>
		<xsl:choose>
			<xsl:when test="$code = 'N'">	
					<xsl:value-of select="'No'"/>
			</xsl:when>
			<xsl:when test="$code = 'Y'">	
					<xsl:value-of select="'Yes'"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$code"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function name="util:IfEmptyThenElse">
		<xsl:param name="data"/>
		<xsl:param name="ifData"/>
		<xsl:param name="ifNotData"/>
		<xsl:choose>
			<xsl:when test="normalize-space($data) = ''">	
					<xsl:value-of select="$ifData"/>
			</xsl:when>
			<xsl:otherwise>
					<xsl:value-of select="$ifNotData"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function name="util:IfThenElse">
		<xsl:param name="cond" as="xs:boolean"/>
		<xsl:param name="ifData"/>
		<xsl:param name="ifNotData"/>
		<xsl:choose>
			<xsl:when test="$cond">	
					<xsl:value-of select="$ifData"/>
			</xsl:when>
			<xsl:otherwise>
					<xsl:value-of select="$ifNotData"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>


</xsl:stylesheet>