<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xi="http://www.w3.org/2001/XInclude" xmlns:util="http://hl7.nist.gov/data-specs/util" xpath-default-namespace="" exclude-result-prefixes="xs" version="2.0">


	<!-- param: output   values: json | jquery-tab-html | ng-tab-html    default: plain-html -->
	<!--xsl:param name="output" select="'json'" /-->
	<!--xsl:param name="output" select="'jquery-tab-html'" -->
	<!--xsl:param name="output" select="'plain-html'"/-->
	<xsl:param name="output" select="'ng-tab-html'"/>
	<xsl:variable name="version" select="'1.2'"/>
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
		<xsl:if test="$output = 'ng-tab-html'">
				<xsl:variable name="full">
					<xsl:call-template name="_main"/>
				</xsl:variable>
				
				<xsl:value-of select="util:begin-tab('FULL', 'All Segments', '', false())"/>
				
				<xsl:value-of select="util:strip-tabsets($full)"/>
				<xsl:value-of select="util:end-tab($ind1, false())"/>
				
		</xsl:if>

		<xsl:call-template name="_main"/>
			
		<xsl:value-of select="util:end($ind1)"/>
	</xsl:template>
	
	<xsl:template name="_main">
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
						<xsl:value-of select="util:end-tab($ind1, false())"/>
					</xsl:if>
		 </xsl:for-each-group>
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
					.message-content legend {text-align:center;font-size:110%; font-weight:bold;}					
					.message-content .nav-tabs {font-weight:bold;}					
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
					.message-content .panel-heading { background-color:#C2E0FF !important; }					
                    }
                    @media print {
					.message-content legend {text-align:center;font-size:110%; font-weight:bold;}					
					.message-content .nav-tabs {font-weight:bold;}					
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
					.message-content .panel-heading { background-color:#C2E0FF !important; }										
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
	<xsl:variable xmlns:fo="http://www.w3.org/1999/XSL/Format" name="HL7Tables">
        <Tables xmlns="">
            <TableDefinition Codesys="PHVS_PulseOximetryUnit_UCUM" Id="PHVS_PulseOximetryUnit_UCUM" Name="Pulse Oximetry Unit" Oid="2.16.840.1.114222.4.11.3590" Type="Local" Version="1">
                <TableElement Code="%" DisplayName="percent" Source="Local"/>
            </TableDefinition>
            <TableDefinition Codesys="PHVS_TemperatureUnit_UCUM" Id="PHVS_TemperatureUnit_UCUM" Name="Temperature Unit" Oid="2.16.840.1.114222.4.11.919" Type="Local" Version="1">
                <TableElement Code="Cel" DisplayName="degree Celsius" Source="Local"/>
                <TableElement Code="[degF]" DisplayName="degree Fahrenheit" Source="Local"/>
            </TableDefinition>
            <TableDefinition Codesys="PH_DiagnosisType_HL7_2x" Id="HL70052" Name="Diagnosis type (HL7)" Oid="2.16.840.1.113883.12.52" Type="HL7" Version="HL7 v2.5">
                <TableElement Code="A" DisplayName="Admitting" Source="HL7"/>
                <TableElement Code="F" DisplayName="Final" Source="HL7"/>
                <TableElement Code="W" DisplayName="Working" Source="HL7"/>
            </TableDefinition>
            <TableDefinition Codesys="PHVS_AgeUnit_SyndromicSurveillance" Id="PHVS_AgeUnit_SyndromicSurveillance" Name="Age Unit (Syndromic Surveillance)" Oid="2.16.840.1.114222.4.11.3402" Type="Local" Version="1">
                <TableElement Code="d" DisplayName="day" Source="Local"/>
                <TableElement Code="mo" DisplayName="month" Source="Local"/>
                <TableElement Code="UNK" DisplayName="unknown" Source="Local"/>
                <TableElement Code="wk" DisplayName="week" Source="Local"/>
                <TableElement Code="a" DisplayName="year" Source="Local"/>
            </TableDefinition>
            <TableDefinition Codesys="PH_RaceAndEthnicity_CDC" Id="CDCREC" Name="Race &amp; Ethnicity - CDC" Oid="2.16.840.1.113883.6.238" Type="HL7" Version="1.1">
                <TableElement Code="1006-6" DisplayName="Abenaki" Source="HL7"/>
                <TableElement Code="1579-2" DisplayName="Absentee Shawnee" Source="HL7"/>
                <TableElement Code="1490-2" DisplayName="Acoma" Source="HL7"/>
                <TableElement Code="2126-1" DisplayName="Afghanistani" Source="HL7"/>
                <TableElement Code="2060-2" DisplayName="African" Source="HL7"/>
                <TableElement Code="2058-6" DisplayName="African American" Source="HL7"/>
                <TableElement Code="1994-3" DisplayName="Agdaagux" Source="HL7"/>
                <TableElement Code="1212-0" DisplayName="Agua Caliente" Source="HL7"/>
                <TableElement Code="1045-4" DisplayName="Agua Caliente Cahuilla" Source="HL7"/>
                <TableElement Code="1740-0" DisplayName="Ahtna" Source="HL7"/>
                <TableElement Code="1654-3" DisplayName="Ak-Chin" Source="HL7"/>
                <TableElement Code="1993-5" DisplayName="Akhiok" Source="HL7"/>
                <TableElement Code="1897-8" DisplayName="Akiachak" Source="HL7"/>
                <TableElement Code="1898-6" DisplayName="Akiak" Source="HL7"/>
                <TableElement Code="2007-3" DisplayName="Akutan" Source="HL7"/>
                <TableElement Code="1187-4" DisplayName="Alabama Coushatta" Source="HL7"/>
                <TableElement Code="1194-0" DisplayName="Alabama Creek" Source="HL7"/>
                <TableElement Code="1195-7" DisplayName="Alabama Quassarte" Source="HL7"/>
                <TableElement Code="1899-4" DisplayName="Alakanuk" Source="HL7"/>
                <TableElement Code="1383-9" DisplayName="Alamo Navajo" Source="HL7"/>
                <TableElement Code="1744-2" DisplayName="Alanvik" Source="HL7"/>
                <TableElement Code="1737-6" DisplayName="Alaska Indian" Source="HL7"/>
                <TableElement Code="1735-0" DisplayName="Alaska Native" Source="HL7"/>
                <TableElement Code="1739-2" DisplayName="Alaskan Athabascan" Source="HL7"/>
                <TableElement Code="1741-8" DisplayName="Alatna" Source="HL7"/>
                <TableElement Code="1900-0" DisplayName="Aleknagik" Source="HL7"/>
                <TableElement Code="1966-1" DisplayName="Aleut" Source="HL7"/>
                <TableElement Code="2008-1" DisplayName="Aleut Corporation" Source="HL7"/>
                <TableElement Code="2009-9" DisplayName="Aleutian" Source="HL7"/>
                <TableElement Code="2010-7" DisplayName="Aleutian Islander" Source="HL7"/>
                <TableElement Code="1742-6" DisplayName="Alexander" Source="HL7"/>
                <TableElement Code="1008-2" DisplayName="Algonquian" Source="HL7"/>
                <TableElement Code="1743-4" DisplayName="Allakaket" Source="HL7"/>
                <TableElement Code="1671-7" DisplayName="Allen Canyon" Source="HL7"/>
                <TableElement Code="1688-1" DisplayName="Alpine" Source="HL7"/>
                <TableElement Code="1392-0" DisplayName="Alsea" Source="HL7"/>
                <TableElement Code="1968-7" DisplayName="Alutiiq Aleut" Source="HL7"/>
                <TableElement Code="1845-7" DisplayName="Ambler" Source="HL7"/>
                <TableElement Code="1004-1" DisplayName="American Indian" Source="HL7"/>
                <TableElement Code="1002-5" DisplayName="American Indian or Alaska Native" Source="HL7"/>
                <TableElement Code="1846-5" DisplayName="Anaktuvuk" Source="HL7"/>
                <TableElement Code="1847-3" DisplayName="Anaktuvuk Pass" Source="HL7"/>
                <TableElement Code="2138-6" DisplayName="Andalusian" Source="HL7"/>
                <TableElement Code="1901-8" DisplayName="Andreafsky" Source="HL7"/>
                <TableElement Code="1814-3" DisplayName="Angoon" Source="HL7"/>
                <TableElement Code="1902-6" DisplayName="Aniak" Source="HL7"/>
                <TableElement Code="1745-9" DisplayName="Anvik" Source="HL7"/>
                <TableElement Code="1010-8" DisplayName="Apache" Source="HL7"/>
                <TableElement Code="2129-5" DisplayName="Arab" Source="HL7"/>
                <TableElement Code="1021-5" DisplayName="Arapaho" Source="HL7"/>
                <TableElement Code="1746-7" DisplayName="Arctic" Source="HL7"/>
                <TableElement Code="1849-9" DisplayName="Arctic Slope Corporation" Source="HL7"/>
                <TableElement Code="1848-1" DisplayName="Arctic Slope Inupiat" Source="HL7"/>
                <TableElement Code="2166-7" DisplayName="Argentinean" Source="HL7"/>
                <TableElement Code="1026-4" DisplayName="Arikara" Source="HL7"/>
                <TableElement Code="1491-0" DisplayName="Arizona Tewa" Source="HL7"/>
                <TableElement Code="2109-7" DisplayName="Armenian" Source="HL7"/>
                <TableElement Code="1366-4" DisplayName="Aroostook" Source="HL7"/>
                <TableElement Code="2028-9" DisplayName="Asian" Source="HL7"/>
                <TableElement Code="2029-7" DisplayName="Asian Indian" Source="HL7"/>
                <TableElement Code="1028-0" DisplayName="Assiniboine" Source="HL7"/>
                <TableElement Code="1030-6" DisplayName="Assiniboine Sioux" Source="HL7"/>
                <TableElement Code="2119-6" DisplayName="Assyrian" Source="HL7"/>
                <TableElement Code="2139-4" DisplayName="Asturian" Source="HL7"/>
                <TableElement Code="2011-5" DisplayName="Atka" Source="HL7"/>
                <TableElement Code="1903-4" DisplayName="Atmautluak" Source="HL7"/>
                <TableElement Code="1850-7" DisplayName="Atqasuk" Source="HL7"/>
                <TableElement Code="1265-8" DisplayName="Atsina" Source="HL7"/>
                <TableElement Code="1234-4" DisplayName="Attacapa" Source="HL7"/>
                <TableElement Code="1046-2" DisplayName="Augustine" Source="HL7"/>
                <TableElement Code="1124-7" DisplayName="Bad River" Source="HL7"/>
                <TableElement Code="2067-7" DisplayName="Bahamian" Source="HL7"/>
                <TableElement Code="2030-5" DisplayName="Bangladeshi" Source="HL7"/>
                <TableElement Code="1033-0" DisplayName="Bannock" Source="HL7"/>
                <TableElement Code="2068-5" DisplayName="Barbadian" Source="HL7"/>
                <TableElement Code="1712-9" DisplayName="Barrio Libre" Source="HL7"/>
                <TableElement Code="1851-5" DisplayName="Barrow" Source="HL7"/>
                <TableElement Code="1587-5" DisplayName="Battle Mountain" Source="HL7"/>
                <TableElement Code="1125-4" DisplayName="Bay Mills Chippewa" Source="HL7"/>
                <TableElement Code="1747-5" DisplayName="Beaver" Source="HL7"/>
                <TableElement Code="2142-8" DisplayName="Belearic Islander" Source="HL7"/>
                <TableElement Code="2012-3" DisplayName="Belkofski" Source="HL7"/>
                <TableElement Code="1852-3" DisplayName="Bering Straits Inupiat" Source="HL7"/>
                <TableElement Code="1904-2" DisplayName="Bethel" Source="HL7"/>
                <TableElement Code="2031-3" DisplayName="Bhutanese" Source="HL7"/>
                <TableElement Code="1567-7" DisplayName="Big Cypress" Source="HL7"/>
                <TableElement Code="1905-9" DisplayName="Bill Moore's Slough" Source="HL7"/>
                <TableElement Code="1235-1" DisplayName="Biloxi" Source="HL7"/>
                <TableElement Code="1748-3" DisplayName="Birch Creek" Source="HL7"/>
                <TableElement Code="1417-5" DisplayName="Bishop" Source="HL7"/>
                <TableElement Code="2056-0" DisplayName="Black" Source="HL7"/>
                <TableElement Code="2054-5" DisplayName="Black or African American" Source="HL7"/>
                <TableElement Code="1035-5" DisplayName="Blackfeet" Source="HL7"/>
                <TableElement Code="1610-5" DisplayName="Blackfoot Sioux" Source="HL7"/>
                <TableElement Code="1126-2" DisplayName="Bois Forte" Source="HL7"/>
                <TableElement Code="2167-5" DisplayName="Bolivian" Source="HL7"/>
                <TableElement Code="2061-0" DisplayName="Botswanan" Source="HL7"/>
                <TableElement Code="1853-1" DisplayName="Brevig Mission" Source="HL7"/>
                <TableElement Code="1418-3" DisplayName="Bridgeport" Source="HL7"/>
                <TableElement Code="1568-5" DisplayName="Brighton" Source="HL7"/>
                <TableElement Code="1972-9" DisplayName="Bristol Bay Aleut" Source="HL7"/>
                <TableElement Code="1906-7" DisplayName="Bristol Bay Yupik" Source="HL7"/>
                <TableElement Code="1037-1" DisplayName="Brotherton" Source="HL7"/>
                <TableElement Code="1611-3" DisplayName="Brule Sioux" Source="HL7"/>
                <TableElement Code="1854-9" DisplayName="Buckland" Source="HL7"/>
                <TableElement Code="2032-1" DisplayName="Burmese" Source="HL7"/>
                <TableElement Code="1419-1" DisplayName="Burns Paiute" Source="HL7"/>
                <TableElement Code="1039-7" DisplayName="Burt Lake Band" Source="HL7"/>
                <TableElement Code="1127-0" DisplayName="Burt Lake Chippewa" Source="HL7"/>
                <TableElement Code="1412-6" DisplayName="Burt Lake Ottawa" Source="HL7"/>
                <TableElement Code="1047-0" DisplayName="Cabazon" Source="HL7"/>
                <TableElement Code="1041-3" DisplayName="Caddo" Source="HL7"/>
                <TableElement Code="1054-6" DisplayName="Cahto" Source="HL7"/>
                <TableElement Code="1044-7" DisplayName="Cahuilla" Source="HL7"/>
                <TableElement Code="1053-8" DisplayName="California Tribes" Source="HL7"/>
                <TableElement Code="1907-5" DisplayName="Calista Yupik" Source="HL7"/>
                <TableElement Code="2033-9" DisplayName="Cambodian" Source="HL7"/>
                <TableElement Code="1223-7" DisplayName="Campo" Source="HL7"/>
                <TableElement Code="1068-6" DisplayName="Canadian and Latin American Indian" Source="HL7"/>
                <TableElement Code="1069-4" DisplayName="Canadian Indian" Source="HL7"/>
                <TableElement Code="2163-4" DisplayName="Canal Zone" Source="HL7"/>
                <TableElement Code="2145-1" DisplayName="Canarian" Source="HL7"/>
                <TableElement Code="1384-7" DisplayName="Canoncito Navajo" Source="HL7"/>
                <TableElement Code="1749-1" DisplayName="Cantwell" Source="HL7"/>
                <TableElement Code="1224-5" DisplayName="Capitan Grande" Source="HL7"/>
                <TableElement Code="2092-5" DisplayName="Carolinian" Source="HL7"/>
                <TableElement Code="1689-9" DisplayName="Carson" Source="HL7"/>
                <TableElement Code="2140-2" DisplayName="Castillian" Source="HL7"/>
                <TableElement Code="2141-0" DisplayName="Catalonian" Source="HL7"/>
                <TableElement Code="1076-9" DisplayName="Catawba" Source="HL7"/>
                <TableElement Code="1286-4" DisplayName="Cayuga" Source="HL7"/>
                <TableElement Code="1078-5" DisplayName="Cayuse" Source="HL7"/>
                <TableElement Code="1420-9" DisplayName="Cedarville" Source="HL7"/>
                <TableElement Code="1393-8" DisplayName="Celilo" Source="HL7"/>
                <TableElement Code="2155-0" DisplayName="Central American" Source="HL7"/>
                <TableElement Code="1070-2" DisplayName="Central American Indian" Source="HL7"/>
                <TableElement Code="2162-6" DisplayName="Central American Indian" Source="HL7"/>
                <TableElement Code="1815-0" DisplayName="Central Council of Tlingit and Haida Tribes" Source="HL7"/>
                <TableElement Code="1465-4" DisplayName="Central Pomo" Source="HL7"/>
                <TableElement Code="1750-9" DisplayName="Chalkyitsik" Source="HL7"/>
                <TableElement Code="2088-3" DisplayName="Chamorro" Source="HL7"/>
                <TableElement Code="1908-3" DisplayName="Chefornak" Source="HL7"/>
                <TableElement Code="1080-1" DisplayName="Chehalis" Source="HL7"/>
                <TableElement Code="1082-7" DisplayName="Chemakuan" Source="HL7"/>
                <TableElement Code="1086-8" DisplayName="Chemehuevi" Source="HL7"/>
                <TableElement Code="1985-1" DisplayName="Chenega" Source="HL7"/>
                <TableElement Code="1088-4" DisplayName="Cherokee" Source="HL7"/>
                <TableElement Code="1089-2" DisplayName="Cherokee Alabama" Source="HL7"/>
                <TableElement Code="1100-7" DisplayName="Cherokee Shawnee" Source="HL7"/>
                <TableElement Code="1090-0" DisplayName="Cherokees of Northeast Alabama" Source="HL7"/>
                <TableElement Code="1091-8" DisplayName="Cherokees of Southeast Alabama" Source="HL7"/>
                <TableElement Code="1909-1" DisplayName="Chevak" Source="HL7"/>
                <TableElement Code="1102-3" DisplayName="Cheyenne" Source="HL7"/>
                <TableElement Code="1612-1" DisplayName="Cheyenne River Sioux" Source="HL7"/>
                <TableElement Code="1106-4" DisplayName="Cheyenne-Arapaho" Source="HL7"/>
                <TableElement Code="2151-9" DisplayName="Chicano" Source="HL7"/>
                <TableElement Code="1108-0" DisplayName="Chickahominy" Source="HL7"/>
                <TableElement Code="1751-7" DisplayName="Chickaloon" Source="HL7"/>
                <TableElement Code="1112-2" DisplayName="Chickasaw" Source="HL7"/>
                <TableElement Code="1973-7" DisplayName="Chignik" Source="HL7"/>
                <TableElement Code="2013-1" DisplayName="Chignik Lagoon" Source="HL7"/>
                <TableElement Code="1974-5" DisplayName="Chignik Lake" Source="HL7"/>
                <TableElement Code="2168-3" DisplayName="Chilean" Source="HL7"/>
                <TableElement Code="1816-8" DisplayName="Chilkat" Source="HL7"/>
                <TableElement Code="1817-6" DisplayName="Chilkoot" Source="HL7"/>
                <TableElement Code="1055-3" DisplayName="Chimariko" Source="HL7"/>
                <TableElement Code="2034-7" DisplayName="Chinese" Source="HL7"/>
                <TableElement Code="1855-6" DisplayName="Chinik" Source="HL7"/>
                <TableElement Code="1114-8" DisplayName="Chinook" Source="HL7"/>
                <TableElement Code="1123-9" DisplayName="Chippewa" Source="HL7"/>
                <TableElement Code="1150-2" DisplayName="Chippewa Cree" Source="HL7"/>
                <TableElement Code="1011-6" DisplayName="Chiricahua" Source="HL7"/>
                <TableElement Code="1752-5" DisplayName="Chistochina" Source="HL7"/>
                <TableElement Code="1153-6" DisplayName="Chitimacha" Source="HL7"/>
                <TableElement Code="1753-3" DisplayName="Chitina" Source="HL7"/>
                <TableElement Code="1155-1" DisplayName="Choctaw" Source="HL7"/>
                <TableElement Code="1910-9" DisplayName="Chuathbaluk" Source="HL7"/>
                <TableElement Code="1984-4" DisplayName="Chugach Aleut" Source="HL7"/>
                <TableElement Code="1986-9" DisplayName="Chugach Corporation" Source="HL7"/>
                <TableElement Code="1718-6" DisplayName="Chukchansi" Source="HL7"/>
                <TableElement Code="1162-7" DisplayName="Chumash" Source="HL7"/>
                <TableElement Code="2097-4" DisplayName="Chuukese" Source="HL7"/>
                <TableElement Code="1754-1" DisplayName="Circle" Source="HL7"/>
                <TableElement Code="1479-5" DisplayName="Citizen Band Potawatomi" Source="HL7"/>
                <TableElement Code="1911-7" DisplayName="Clark's Point" Source="HL7"/>
                <TableElement Code="1115-5" DisplayName="Clatsop" Source="HL7"/>
                <TableElement Code="1165-0" DisplayName="Clear Lake" Source="HL7"/>
                <TableElement Code="1156-9" DisplayName="Clifton Choctaw" Source="HL7"/>
                <TableElement Code="1056-1" DisplayName="Coast Miwok" Source="HL7"/>
                <TableElement Code="1733-5" DisplayName="Coast Yurok" Source="HL7"/>
                <TableElement Code="1492-8" DisplayName="Cochiti" Source="HL7"/>
                <TableElement Code="1725-1" DisplayName="Cocopah" Source="HL7"/>
                <TableElement Code="1167-6" DisplayName="Coeur D'Alene" Source="HL7"/>
                <TableElement Code="1169-2" DisplayName="Coharie" Source="HL7"/>
                <TableElement Code="2169-1" DisplayName="Colombian" Source="HL7"/>
                <TableElement Code="1171-8" DisplayName="Colorado River" Source="HL7"/>
                <TableElement Code="1394-6" DisplayName="Columbia" Source="HL7"/>
                <TableElement Code="1116-3" DisplayName="Columbia River Chinook" Source="HL7"/>
                <TableElement Code="1173-4" DisplayName="Colville" Source="HL7"/>
                <TableElement Code="1175-9" DisplayName="Comanche" Source="HL7"/>
                <TableElement Code="1755-8" DisplayName="Cook Inlet" Source="HL7"/>
                <TableElement Code="1180-9" DisplayName="Coos" Source="HL7"/>
                <TableElement Code="1178-3" DisplayName="Coos, Lower Umpqua, Siuslaw" Source="HL7"/>
                <TableElement Code="1756-6" DisplayName="Copper Center" Source="HL7"/>
                <TableElement Code="1757-4" DisplayName="Copper River" Source="HL7"/>
                <TableElement Code="1182-5" DisplayName="Coquilles" Source="HL7"/>
                <TableElement Code="2156-8" DisplayName="Costa Rican" Source="HL7"/>
                <TableElement Code="1184-1" DisplayName="Costanoan" Source="HL7"/>
                <TableElement Code="1856-4" DisplayName="Council" Source="HL7"/>
                <TableElement Code="1186-6" DisplayName="Coushatta" Source="HL7"/>
                <TableElement Code="1668-3" DisplayName="Cow Creek Umpqua" Source="HL7"/>
                <TableElement Code="1189-0" DisplayName="Cowlitz" Source="HL7"/>
                <TableElement Code="1818-4" DisplayName="Craig" Source="HL7"/>
                <TableElement Code="1191-6" DisplayName="Cree" Source="HL7"/>
                <TableElement Code="1193-2" DisplayName="Creek" Source="HL7"/>
                <TableElement Code="2176-6" DisplayName="Criollo" Source="HL7"/>
                <TableElement Code="1207-0" DisplayName="Croatan" Source="HL7"/>
                <TableElement Code="1912-5" DisplayName="Crooked Creek" Source="HL7"/>
                <TableElement Code="1209-6" DisplayName="Crow" Source="HL7"/>
                <TableElement Code="1613-9" DisplayName="Crow Creek Sioux" Source="HL7"/>
                <TableElement Code="2182-4" DisplayName="Cuban" Source="HL7"/>
                <TableElement Code="1211-2" DisplayName="Cupeno" Source="HL7"/>
                <TableElement Code="1225-2" DisplayName="Cuyapaipe" Source="HL7"/>
                <TableElement Code="1614-7" DisplayName="Dakota Sioux" Source="HL7"/>
                <TableElement Code="1857-2" DisplayName="Deering" Source="HL7"/>
                <TableElement Code="1214-6" DisplayName="Delaware" Source="HL7"/>
                <TableElement Code="1222-9" DisplayName="Diegueno" Source="HL7"/>
                <TableElement Code="1057-9" DisplayName="Digger" Source="HL7"/>
                <TableElement Code="1913-3" DisplayName="Dillingham" Source="HL7"/>
                <TableElement Code="2070-1" DisplayName="Dominica Islander" Source="HL7"/>
                <TableElement Code="2069-3" DisplayName="Dominican" Source="HL7"/>
                <TableElement Code="2184-0" DisplayName="Dominican" Source="HL7"/>
                <TableElement Code="1758-2" DisplayName="Dot Lake" Source="HL7"/>
                <TableElement Code="1819-2" DisplayName="Douglas" Source="HL7"/>
                <TableElement Code="1759-0" DisplayName="Doyon" Source="HL7"/>
                <TableElement Code="1690-7" DisplayName="Dresslerville" Source="HL7"/>
                <TableElement Code="1466-2" DisplayName="Dry Creek" Source="HL7"/>
                <TableElement Code="1603-0" DisplayName="Duck Valley" Source="HL7"/>
                <TableElement Code="1588-3" DisplayName="Duckwater" Source="HL7"/>
                <TableElement Code="1519-8" DisplayName="Duwamish" Source="HL7"/>
                <TableElement Code="1760-8" DisplayName="Eagle" Source="HL7"/>
                <TableElement Code="1092-6" DisplayName="Eastern Cherokee" Source="HL7"/>
                <TableElement Code="1109-8" DisplayName="Eastern Chickahominy" Source="HL7"/>
                <TableElement Code="1196-5" DisplayName="Eastern Creek" Source="HL7"/>
                <TableElement Code="1215-3" DisplayName="Eastern Delaware" Source="HL7"/>
                <TableElement Code="1197-3" DisplayName="Eastern Muscogee" Source="HL7"/>
                <TableElement Code="1467-0" DisplayName="Eastern Pomo" Source="HL7"/>
                <TableElement Code="1580-0" DisplayName="Eastern Shawnee" Source="HL7"/>
                <TableElement Code="1233-6" DisplayName="Eastern Tribes" Source="HL7"/>
                <TableElement Code="1093-4" DisplayName="Echota Cherokee" Source="HL7"/>
                <TableElement Code="2170-9" DisplayName="Ecuadorian" Source="HL7"/>
                <TableElement Code="1914-1" DisplayName="Eek" Source="HL7"/>
                <TableElement Code="1975-2" DisplayName="Egegik" Source="HL7"/>
                <TableElement Code="2120-4" DisplayName="Egyptian" Source="HL7"/>
                <TableElement Code="1761-6" DisplayName="Eklutna" Source="HL7"/>
                <TableElement Code="1915-8" DisplayName="Ekuk" Source="HL7"/>
                <TableElement Code="1916-6" DisplayName="Ekwok" Source="HL7"/>
                <TableElement Code="1858-0" DisplayName="Elim" Source="HL7"/>
                <TableElement Code="1589-1" DisplayName="Elko" Source="HL7"/>
                <TableElement Code="1590-9" DisplayName="Ely" Source="HL7"/>
                <TableElement Code="1917-4" DisplayName="Emmonak" Source="HL7"/>
                <TableElement Code="2110-5" DisplayName="English" Source="HL7"/>
                <TableElement Code="1987-7" DisplayName="English Bay" Source="HL7"/>
                <TableElement Code="1840-8" DisplayName="Eskimo" Source="HL7"/>
                <TableElement Code="1250-0" DisplayName="Esselen" Source="HL7"/>
                <TableElement Code="2062-8" DisplayName="Ethiopian" Source="HL7"/>
                <TableElement Code="2133-7" DisplayName="Ethnicity" Source="HL7"/>
                <TableElement Code="1094-2" DisplayName="Etowah Cherokee" Source="HL7"/>
                <TableElement Code="2108-9" DisplayName="European" Source="HL7"/>
                <TableElement Code="1762-4" DisplayName="Evansville" Source="HL7"/>
                <TableElement Code="1990-1" DisplayName="Eyak" Source="HL7"/>
                <TableElement Code="1604-8" DisplayName="Fallon" Source="HL7"/>
                <TableElement Code="2015-6" DisplayName="False Pass" Source="HL7"/>
                <TableElement Code="2101-4" DisplayName="Fijian" Source="HL7"/>
                <TableElement Code="2036-2" DisplayName="Filipino" Source="HL7"/>
                <TableElement Code="1615-4" DisplayName="Flandreau Santee" Source="HL7"/>
                <TableElement Code="1569-3" DisplayName="Florida Seminole" Source="HL7"/>
                <TableElement Code="1128-8" DisplayName="Fond du Lac" Source="HL7"/>
                <TableElement Code="1480-3" DisplayName="Forest County" Source="HL7"/>
                <TableElement Code="1252-6" DisplayName="Fort Belknap" Source="HL7"/>
                <TableElement Code="1254-2" DisplayName="Fort Berthold" Source="HL7"/>
                <TableElement Code="1421-7" DisplayName="Fort Bidwell" Source="HL7"/>
                <TableElement Code="1258-3" DisplayName="Fort Hall" Source="HL7"/>
                <TableElement Code="1422-5" DisplayName="Fort Independence" Source="HL7"/>
                <TableElement Code="1605-5" DisplayName="Fort McDermitt" Source="HL7"/>
                <TableElement Code="1256-7" DisplayName="Fort Mcdowell" Source="HL7"/>
                <TableElement Code="1616-2" DisplayName="Fort Peck" Source="HL7"/>
                <TableElement Code="1031-4" DisplayName="Fort Peck Assiniboine Sioux" Source="HL7"/>
                <TableElement Code="1012-4" DisplayName="Fort Sill Apache" Source="HL7"/>
                <TableElement Code="1763-2" DisplayName="Fort Yukon" Source="HL7"/>
                <TableElement Code="2111-3" DisplayName="French" Source="HL7"/>
                <TableElement Code="1071-0" DisplayName="French American Indian" Source="HL7"/>
                <TableElement Code="1260-9" DisplayName="Gabrieleno" Source="HL7"/>
                <TableElement Code="1764-0" DisplayName="Gakona" Source="HL7"/>
                <TableElement Code="1765-7" DisplayName="Galena" Source="HL7"/>
                <TableElement Code="2143-6" DisplayName="Gallego" Source="HL7"/>
                <TableElement Code="1892-9" DisplayName="Gambell" Source="HL7"/>
                <TableElement Code="1680-8" DisplayName="Gay Head Wampanoag" Source="HL7"/>
                <TableElement Code="1236-9" DisplayName="Georgetown (Eastern Tribes)" Source="HL7"/>
                <TableElement Code="1962-0" DisplayName="Georgetown (Yupik-Eskimo)" Source="HL7"/>
                <TableElement Code="2112-1" DisplayName="German" Source="HL7"/>
                <TableElement Code="1655-0" DisplayName="Gila Bend" Source="HL7"/>
                <TableElement Code="1457-1" DisplayName="Gila River Pima-Maricopa" Source="HL7"/>
                <TableElement Code="1859-8" DisplayName="Golovin" Source="HL7"/>
                <TableElement Code="1918-2" DisplayName="Goodnews Bay" Source="HL7"/>
                <TableElement Code="1591-7" DisplayName="Goshute" Source="HL7"/>
                <TableElement Code="1129-6" DisplayName="Grand Portage" Source="HL7"/>
                <TableElement Code="1262-5" DisplayName="Grand Ronde" Source="HL7"/>
                <TableElement Code="1130-4" DisplayName="Grand Traverse Band of Ottawa/Chippewa" Source="HL7"/>
                <TableElement Code="1766-5" DisplayName="Grayling" Source="HL7"/>
                <TableElement Code="1842-4" DisplayName="Greenland Eskimo" Source="HL7"/>
                <TableElement Code="1264-1" DisplayName="Gros Ventres" Source="HL7"/>
                <TableElement Code="2087-5" DisplayName="Guamanian" Source="HL7"/>
                <TableElement Code="2086-7" DisplayName="Guamanian or Chamorro" Source="HL7"/>
                <TableElement Code="2157-6" DisplayName="Guatemalan" Source="HL7"/>
                <TableElement Code="1767-3" DisplayName="Gulkana" Source="HL7"/>
                <TableElement Code="1820-0" DisplayName="Haida" Source="HL7"/>
                <TableElement Code="2071-9" DisplayName="Haitian" Source="HL7"/>
                <TableElement Code="1267-4" DisplayName="Haliwa" Source="HL7"/>
                <TableElement Code="1481-1" DisplayName="Hannahville" Source="HL7"/>
                <TableElement Code="1726-9" DisplayName="Havasupai" Source="HL7"/>
                <TableElement Code="1768-1" DisplayName="Healy Lake" Source="HL7"/>
                <TableElement Code="1269-0" DisplayName="Hidatsa" Source="HL7"/>
                <TableElement Code="2135-2" DisplayName="Hispanic or Latino" Source="HL7"/>
                <TableElement Code="2037-0" DisplayName="Hmong" Source="HL7"/>
                <TableElement Code="1697-2" DisplayName="Ho-chunk" Source="HL7"/>
                <TableElement Code="1083-5" DisplayName="Hoh" Source="HL7"/>
                <TableElement Code="1570-1" DisplayName="Hollywood Seminole" Source="HL7"/>
                <TableElement Code="1769-9" DisplayName="Holy Cross" Source="HL7"/>
                <TableElement Code="2158-4" DisplayName="Honduran" Source="HL7"/>
                <TableElement Code="1821-8" DisplayName="Hoonah" Source="HL7"/>
                <TableElement Code="1271-6" DisplayName="Hoopa" Source="HL7"/>
                <TableElement Code="1275-7" DisplayName="Hoopa Extension" Source="HL7"/>
                <TableElement Code="1919-0" DisplayName="Hooper Bay" Source="HL7"/>
                <TableElement Code="1493-6" DisplayName="Hopi" Source="HL7"/>
                <TableElement Code="1277-3" DisplayName="Houma" Source="HL7"/>
                <TableElement Code="1727-7" DisplayName="Hualapai" Source="HL7"/>
                <TableElement Code="1770-7" DisplayName="Hughes" Source="HL7"/>
                <TableElement Code="1482-9" DisplayName="Huron Potawatomi" Source="HL7"/>
                <TableElement Code="1771-5" DisplayName="Huslia" Source="HL7"/>
                <TableElement Code="1822-6" DisplayName="Hydaburg" Source="HL7"/>
                <TableElement Code="1976-0" DisplayName="Igiugig" Source="HL7"/>
                <TableElement Code="1772-3" DisplayName="Iliamna" Source="HL7"/>
                <TableElement Code="1359-9" DisplayName="Illinois Miami" Source="HL7"/>
                <TableElement Code="1279-9" DisplayName="Inaja-Cosmit" Source="HL7"/>
                <TableElement Code="1860-6" DisplayName="Inalik Diomede" Source="HL7"/>
                <TableElement Code="1442-3" DisplayName="Indian Township" Source="HL7"/>
                <TableElement Code="1360-7" DisplayName="Indiana Miami" Source="HL7"/>
                <TableElement Code="2038-8" DisplayName="Indonesian" Source="HL7"/>
                <TableElement Code="1861-4" DisplayName="Inupiaq" Source="HL7"/>
                <TableElement Code="1844-0" DisplayName="Inupiat Eskimo" Source="HL7"/>
                <TableElement Code="1281-5" DisplayName="Iowa" Source="HL7"/>
                <TableElement Code="1282-3" DisplayName="Iowa of Kansas-Nebraska" Source="HL7"/>
                <TableElement Code="1283-1" DisplayName="Iowa of Oklahoma" Source="HL7"/>
                <TableElement Code="1552-9" DisplayName="Iowa Sac and Fox" Source="HL7"/>
                <TableElement Code="1920-8" DisplayName="Iqurmuit (Russian Mission)" Source="HL7"/>
                <TableElement Code="2121-2" DisplayName="Iranian" Source="HL7"/>
                <TableElement Code="2122-0" DisplayName="Iraqi" Source="HL7"/>
                <TableElement Code="2113-9" DisplayName="Irish" Source="HL7"/>
                <TableElement Code="1285-6" DisplayName="Iroquois" Source="HL7"/>
                <TableElement Code="1494-4" DisplayName="Isleta" Source="HL7"/>
                <TableElement Code="2127-9" DisplayName="Israeili" Source="HL7"/>
                <TableElement Code="2114-7" DisplayName="Italian" Source="HL7"/>
                <TableElement Code="1977-8" DisplayName="Ivanof Bay" Source="HL7"/>
                <TableElement Code="2048-7" DisplayName="Iwo Jiman" Source="HL7"/>
                <TableElement Code="2072-7" DisplayName="Jamaican" Source="HL7"/>
                <TableElement Code="1313-6" DisplayName="Jamestown" Source="HL7"/>
                <TableElement Code="2039-6" DisplayName="Japanese" Source="HL7"/>
                <TableElement Code="1495-1" DisplayName="Jemez" Source="HL7"/>
                <TableElement Code="1157-7" DisplayName="Jena Choctaw" Source="HL7"/>
                <TableElement Code="1013-2" DisplayName="Jicarilla Apache" Source="HL7"/>
                <TableElement Code="1297-1" DisplayName="Juaneno" Source="HL7"/>
                <TableElement Code="1423-3" DisplayName="Kaibab" Source="HL7"/>
                <TableElement Code="1823-4" DisplayName="Kake" Source="HL7"/>
                <TableElement Code="1862-2" DisplayName="Kaktovik" Source="HL7"/>
                <TableElement Code="1395-3" DisplayName="Kalapuya" Source="HL7"/>
                <TableElement Code="1299-7" DisplayName="Kalispel" Source="HL7"/>
                <TableElement Code="1921-6" DisplayName="Kalskag" Source="HL7"/>
                <TableElement Code="1773-1" DisplayName="Kaltag" Source="HL7"/>
                <TableElement Code="1995-0" DisplayName="Karluk" Source="HL7"/>
                <TableElement Code="1301-1" DisplayName="Karuk" Source="HL7"/>
                <TableElement Code="1824-2" DisplayName="Kasaan" Source="HL7"/>
                <TableElement Code="1468-8" DisplayName="Kashia" Source="HL7"/>
                <TableElement Code="1922-4" DisplayName="Kasigluk" Source="HL7"/>
                <TableElement Code="1117-1" DisplayName="Kathlamet" Source="HL7"/>
                <TableElement Code="1303-7" DisplayName="Kaw" Source="HL7"/>
                <TableElement Code="1058-7" DisplayName="Kawaiisu" Source="HL7"/>
                <TableElement Code="1863-0" DisplayName="Kawerak" Source="HL7"/>
                <TableElement Code="1825-9" DisplayName="Kenaitze" Source="HL7"/>
                <TableElement Code="1496-9" DisplayName="Keres" Source="HL7"/>
                <TableElement Code="1059-5" DisplayName="Kern River" Source="HL7"/>
                <TableElement Code="1826-7" DisplayName="Ketchikan" Source="HL7"/>
                <TableElement Code="1131-2" DisplayName="Keweenaw" Source="HL7"/>
                <TableElement Code="1198-1" DisplayName="Kialegee" Source="HL7"/>
                <TableElement Code="1864-8" DisplayName="Kiana" Source="HL7"/>
                <TableElement Code="1305-2" DisplayName="Kickapoo" Source="HL7"/>
                <TableElement Code="1520-6" DisplayName="Kikiallus" Source="HL7"/>
                <TableElement Code="2014-9" DisplayName="King Cove" Source="HL7"/>
                <TableElement Code="1978-6" DisplayName="King Salmon" Source="HL7"/>
                <TableElement Code="1309-4" DisplayName="Kiowa" Source="HL7"/>
                <TableElement Code="1923-2" DisplayName="Kipnuk" Source="HL7"/>
                <TableElement Code="2096-6" DisplayName="Kiribati" Source="HL7"/>
                <TableElement Code="1865-5" DisplayName="Kivalina" Source="HL7"/>
                <TableElement Code="1312-8" DisplayName="Klallam" Source="HL7"/>
                <TableElement Code="1317-7" DisplayName="Klamath" Source="HL7"/>
                <TableElement Code="1827-5" DisplayName="Klawock" Source="HL7"/>
                <TableElement Code="1774-9" DisplayName="Kluti Kaah" Source="HL7"/>
                <TableElement Code="1775-6" DisplayName="Knik" Source="HL7"/>
                <TableElement Code="1866-3" DisplayName="Kobuk" Source="HL7"/>
                <TableElement Code="1996-8" DisplayName="Kodiak" Source="HL7"/>
                <TableElement Code="1979-4" DisplayName="Kokhanok" Source="HL7"/>
                <TableElement Code="1924-0" DisplayName="Koliganek" Source="HL7"/>
                <TableElement Code="1925-7" DisplayName="Kongiganak" Source="HL7"/>
                <TableElement Code="1992-7" DisplayName="Koniag Aleut" Source="HL7"/>
                <TableElement Code="1319-3" DisplayName="Konkow" Source="HL7"/>
                <TableElement Code="1321-9" DisplayName="Kootenai" Source="HL7"/>
                <TableElement Code="2040-4" DisplayName="Korean" Source="HL7"/>
                <TableElement Code="2093-3" DisplayName="Kosraean" Source="HL7"/>
                <TableElement Code="1926-5" DisplayName="Kotlik" Source="HL7"/>
                <TableElement Code="1867-1" DisplayName="Kotzebue" Source="HL7"/>
                <TableElement Code="1868-9" DisplayName="Koyuk" Source="HL7"/>
                <TableElement Code="1776-4" DisplayName="Koyukuk" Source="HL7"/>
                <TableElement Code="1927-3" DisplayName="Kwethluk" Source="HL7"/>
                <TableElement Code="1928-1" DisplayName="Kwigillingok" Source="HL7"/>
                <TableElement Code="1869-7" DisplayName="Kwiguk" Source="HL7"/>
                <TableElement Code="1332-6" DisplayName="La Jolla" Source="HL7"/>
                <TableElement Code="1226-0" DisplayName="La Posta" Source="HL7"/>
                <TableElement Code="2152-7" DisplayName="La Raza" Source="HL7"/>
                <TableElement Code="1132-0" DisplayName="Lac Courte Oreilles" Source="HL7"/>
                <TableElement Code="1133-8" DisplayName="Lac du Flambeau" Source="HL7"/>
                <TableElement Code="1134-6" DisplayName="Lac Vieux Desert Chippewa" Source="HL7"/>
                <TableElement Code="1497-7" DisplayName="Laguna" Source="HL7"/>
                <TableElement Code="1777-2" DisplayName="Lake Minchumina" Source="HL7"/>
                <TableElement Code="1135-3" DisplayName="Lake Superior" Source="HL7"/>
                <TableElement Code="1617-0" DisplayName="Lake Traverse Sioux" Source="HL7"/>
                <TableElement Code="2041-2" DisplayName="Laotian" Source="HL7"/>
                <TableElement Code="1997-6" DisplayName="Larsen Bay" Source="HL7"/>
                <TableElement Code="1424-1" DisplayName="Las Vegas" Source="HL7"/>
                <TableElement Code="1323-5" DisplayName="Lassik" Source="HL7"/>
                <TableElement Code="2178-2" DisplayName="Latin American" Source="HL7"/>
                <TableElement Code="2123-8" DisplayName="Lebanese" Source="HL7"/>
                <TableElement Code="1136-1" DisplayName="Leech Lake" Source="HL7"/>
                <TableElement Code="1216-1" DisplayName="Lenni-Lenape" Source="HL7"/>
                <TableElement Code="1929-9" DisplayName="Levelock" Source="HL7"/>
                <TableElement Code="2063-6" DisplayName="Liberian" Source="HL7"/>
                <TableElement Code="1778-0" DisplayName="Lime" Source="HL7"/>
                <TableElement Code="1014-0" DisplayName="Lipan Apache" Source="HL7"/>
                <TableElement Code="1137-9" DisplayName="Little Shell Chippewa" Source="HL7"/>
                <TableElement Code="1425-8" DisplayName="Lone Pine" Source="HL7"/>
                <TableElement Code="1325-0" DisplayName="Long Island" Source="HL7"/>
                <TableElement Code="1048-8" DisplayName="Los Coyotes" Source="HL7"/>
                <TableElement Code="1426-6" DisplayName="Lovelock" Source="HL7"/>
                <TableElement Code="1618-8" DisplayName="Lower Brule Sioux" Source="HL7"/>
                <TableElement Code="1314-4" DisplayName="Lower Elwha" Source="HL7"/>
                <TableElement Code="1930-7" DisplayName="Lower Kalskag" Source="HL7"/>
                <TableElement Code="1199-9" DisplayName="Lower Muscogee" Source="HL7"/>
                <TableElement Code="1619-6" DisplayName="Lower Sioux" Source="HL7"/>
                <TableElement Code="1521-4" DisplayName="Lower Skagit" Source="HL7"/>
                <TableElement Code="1331-8" DisplayName="Luiseno" Source="HL7"/>
                <TableElement Code="1340-9" DisplayName="Lumbee" Source="HL7"/>
                <TableElement Code="1342-5" DisplayName="Lummi" Source="HL7"/>
                <TableElement Code="1200-5" DisplayName="Machis Lower Creek Indian" Source="HL7"/>
                <TableElement Code="2052-9" DisplayName="Madagascar" Source="HL7"/>
                <TableElement Code="1344-1" DisplayName="Maidu" Source="HL7"/>
                <TableElement Code="1348-2" DisplayName="Makah" Source="HL7"/>
                <TableElement Code="2042-0" DisplayName="Malaysian" Source="HL7"/>
                <TableElement Code="2049-5" DisplayName="Maldivian" Source="HL7"/>
                <TableElement Code="1427-4" DisplayName="Malheur Paiute" Source="HL7"/>
                <TableElement Code="1350-8" DisplayName="Maliseet" Source="HL7"/>
                <TableElement Code="1352-4" DisplayName="Mandan" Source="HL7"/>
                <TableElement Code="1780-6" DisplayName="Manley Hot Springs" Source="HL7"/>
                <TableElement Code="1931-5" DisplayName="Manokotak" Source="HL7"/>
                <TableElement Code="1227-8" DisplayName="Manzanita" Source="HL7"/>
                <TableElement Code="2089-1" DisplayName="Mariana Islander" Source="HL7"/>
                <TableElement Code="1728-5" DisplayName="Maricopa" Source="HL7"/>
                <TableElement Code="1932-3" DisplayName="Marshall" Source="HL7"/>
                <TableElement Code="2090-9" DisplayName="Marshallese" Source="HL7"/>
                <TableElement Code="1454-8" DisplayName="Marshantucket Pequot" Source="HL7"/>
                <TableElement Code="1889-5" DisplayName="Mary's Igloo" Source="HL7"/>
                <TableElement Code="1681-6" DisplayName="Mashpee Wampanoag" Source="HL7"/>
                <TableElement Code="1326-8" DisplayName="Matinecock" Source="HL7"/>
                <TableElement Code="1354-0" DisplayName="Mattaponi" Source="HL7"/>
                <TableElement Code="1060-3" DisplayName="Mattole" Source="HL7"/>
                <TableElement Code="1870-5" DisplayName="Mauneluk Inupiat" Source="HL7"/>
                <TableElement Code="1779-8" DisplayName="Mcgrath" Source="HL7"/>
                <TableElement Code="1620-4" DisplayName="Mdewakanton Sioux" Source="HL7"/>
                <TableElement Code="1933-1" DisplayName="Mekoryuk" Source="HL7"/>
                <TableElement Code="2100-6" DisplayName="Melanesian" Source="HL7"/>
                <TableElement Code="1356-5" DisplayName="Menominee" Source="HL7"/>
                <TableElement Code="1781-4" DisplayName="Mentasta Lake" Source="HL7"/>
                <TableElement Code="1228-6" DisplayName="Mesa Grande" Source="HL7"/>
                <TableElement Code="1015-7" DisplayName="Mescalero Apache" Source="HL7"/>
                <TableElement Code="1838-2" DisplayName="Metlakatla" Source="HL7"/>
                <TableElement Code="2148-5" DisplayName="Mexican" Source="HL7"/>
                <TableElement Code="2149-3" DisplayName="Mexican American" Source="HL7"/>
                <TableElement Code="1072-8" DisplayName="Mexican American Indian" Source="HL7"/>
                <TableElement Code="2153-5" DisplayName="Mexican American Indian" Source="HL7"/>
                <TableElement Code="2150-1" DisplayName="Mexicano" Source="HL7"/>
                <TableElement Code="1358-1" DisplayName="Miami" Source="HL7"/>
                <TableElement Code="1363-1" DisplayName="Miccosukee" Source="HL7"/>
                <TableElement Code="1413-4" DisplayName="Michigan Ottawa" Source="HL7"/>
                <TableElement Code="1365-6" DisplayName="Micmac" Source="HL7"/>
                <TableElement Code="2085-9" DisplayName="Micronesian" Source="HL7"/>
                <TableElement Code="2118-8" DisplayName="Middle Eastern or North African" Source="HL7"/>
                <TableElement Code="1138-7" DisplayName="Mille Lacs" Source="HL7"/>
                <TableElement Code="1621-2" DisplayName="Miniconjou" Source="HL7"/>
                <TableElement Code="1139-5" DisplayName="Minnesota Chippewa" Source="HL7"/>
                <TableElement Code="1782-2" DisplayName="Minto" Source="HL7"/>
                <TableElement Code="1368-0" DisplayName="Mission Indians" Source="HL7"/>
                <TableElement Code="1158-5" DisplayName="Mississippi Choctaw" Source="HL7"/>
                <TableElement Code="1553-7" DisplayName="Missouri Sac and Fox" Source="HL7"/>
                <TableElement Code="1370-6" DisplayName="Miwok" Source="HL7"/>
                <TableElement Code="1428-2" DisplayName="Moapa" Source="HL7"/>
                <TableElement Code="1372-2" DisplayName="Modoc" Source="HL7"/>
                <TableElement Code="1729-3" DisplayName="Mohave" Source="HL7"/>
                <TableElement Code="1287-2" DisplayName="Mohawk" Source="HL7"/>
                <TableElement Code="1374-8" DisplayName="Mohegan" Source="HL7"/>
                <TableElement Code="1396-1" DisplayName="Molala" Source="HL7"/>
                <TableElement Code="1376-3" DisplayName="Mono" Source="HL7"/>
                <TableElement Code="1327-6" DisplayName="Montauk" Source="HL7"/>
                <TableElement Code="1237-7" DisplayName="Moor" Source="HL7"/>
                <TableElement Code="1049-6" DisplayName="Morongo" Source="HL7"/>
                <TableElement Code="1345-8" DisplayName="Mountain Maidu" Source="HL7"/>
                <TableElement Code="1934-9" DisplayName="Mountain Village" Source="HL7"/>
                <TableElement Code="1159-3" DisplayName="Mowa Band of Choctaw" Source="HL7"/>
                <TableElement Code="1522-2" DisplayName="Muckleshoot" Source="HL7"/>
                <TableElement Code="1217-9" DisplayName="Munsee" Source="HL7"/>
                <TableElement Code="1935-6" DisplayName="Naknek" Source="HL7"/>
                <TableElement Code="1498-5" DisplayName="Nambe" Source="HL7"/>
                <TableElement Code="2064-4" DisplayName="Namibian" Source="HL7"/>
                <TableElement Code="1871-3" DisplayName="Nana Inupiat" Source="HL7"/>
                <TableElement Code="1238-5" DisplayName="Nansemond" Source="HL7"/>
                <TableElement Code="1378-9" DisplayName="Nanticoke" Source="HL7"/>
                <TableElement Code="1937-2" DisplayName="Napakiak" Source="HL7"/>
                <TableElement Code="1938-0" DisplayName="Napaskiak" Source="HL7"/>
                <TableElement Code="1936-4" DisplayName="Napaumute" Source="HL7"/>
                <TableElement Code="1380-5" DisplayName="Narragansett" Source="HL7"/>
                <TableElement Code="1239-3" DisplayName="Natchez" Source="HL7"/>
                <TableElement Code="2079-2" DisplayName="Native Hawaiian" Source="HL7"/>
                <TableElement Code="2076-8" DisplayName="Native Hawaiian or Other Pacific Islander" Source="HL7"/>
                <TableElement Code="1240-1" DisplayName="Nausu Waiwash" Source="HL7"/>
                <TableElement Code="1382-1" DisplayName="Navajo" Source="HL7"/>
                <TableElement Code="1475-3" DisplayName="Nebraska Ponca" Source="HL7"/>
                <TableElement Code="1698-0" DisplayName="Nebraska Winnebago" Source="HL7"/>
                <TableElement Code="2016-4" DisplayName="Nelson Lagoon" Source="HL7"/>
                <TableElement Code="1783-0" DisplayName="Nenana" Source="HL7"/>
                <TableElement Code="2050-3" DisplayName="Nepalese" Source="HL7"/>
                <TableElement Code="2104-8" DisplayName="New Hebrides" Source="HL7"/>
                <TableElement Code="1940-6" DisplayName="New Stuyahok" Source="HL7"/>
                <TableElement Code="1939-8" DisplayName="Newhalen" Source="HL7"/>
                <TableElement Code="1941-4" DisplayName="Newtok" Source="HL7"/>
                <TableElement Code="1387-0" DisplayName="Nez Perce" Source="HL7"/>
                <TableElement Code="2159-2" DisplayName="Nicaraguan" Source="HL7"/>
                <TableElement Code="2065-1" DisplayName="Nigerian" Source="HL7"/>
                <TableElement Code="1942-2" DisplayName="Nightmute" Source="HL7"/>
                <TableElement Code="1784-8" DisplayName="Nikolai" Source="HL7"/>
                <TableElement Code="2017-2" DisplayName="Nikolski" Source="HL7"/>
                <TableElement Code="1785-5" DisplayName="Ninilchik" Source="HL7"/>
                <TableElement Code="1241-9" DisplayName="Nipmuc" Source="HL7"/>
                <TableElement Code="1346-6" DisplayName="Nishinam" Source="HL7"/>
                <TableElement Code="1523-0" DisplayName="Nisqually" Source="HL7"/>
                <TableElement Code="1872-1" DisplayName="Noatak" Source="HL7"/>
                <TableElement Code="1389-6" DisplayName="Nomalaki" Source="HL7"/>
                <TableElement Code="1873-9" DisplayName="Nome" Source="HL7"/>
                <TableElement Code="1786-3" DisplayName="Nondalton" Source="HL7"/>
                <TableElement Code="1524-8" DisplayName="Nooksack" Source="HL7"/>
                <TableElement Code="1874-7" DisplayName="Noorvik" Source="HL7"/>
                <TableElement Code="1022-3" DisplayName="Northern Arapaho" Source="HL7"/>
                <TableElement Code="1095-9" DisplayName="Northern Cherokee" Source="HL7"/>
                <TableElement Code="1103-1" DisplayName="Northern Cheyenne" Source="HL7"/>
                <TableElement Code="1429-0" DisplayName="Northern Paiute" Source="HL7"/>
                <TableElement Code="1469-6" DisplayName="Northern Pomo" Source="HL7"/>
                <TableElement Code="1787-1" DisplayName="Northway" Source="HL7"/>
                <TableElement Code="1391-2" DisplayName="Northwest Tribes" Source="HL7"/>
                <TableElement Code="2186-5" DisplayName="Not Hispanic or Latino" Source="HL7"/>
                <TableElement Code="1875-4" DisplayName="Nuiqsut" Source="HL7"/>
                <TableElement Code="1788-9" DisplayName="Nulato" Source="HL7"/>
                <TableElement Code="1943-0" DisplayName="Nunapitchukv" Source="HL7"/>
                <TableElement Code="1622-0" DisplayName="Oglala Sioux" Source="HL7"/>
                <TableElement Code="2043-8" DisplayName="Okinawan" Source="HL7"/>
                <TableElement Code="1016-5" DisplayName="Oklahoma Apache" Source="HL7"/>
                <TableElement Code="1042-1" DisplayName="Oklahoma Cado" Source="HL7"/>
                <TableElement Code="1160-1" DisplayName="Oklahoma Choctaw" Source="HL7"/>
                <TableElement Code="1176-7" DisplayName="Oklahoma Comanche" Source="HL7"/>
                <TableElement Code="1218-7" DisplayName="Oklahoma Delaware" Source="HL7"/>
                <TableElement Code="1306-0" DisplayName="Oklahoma Kickapoo" Source="HL7"/>
                <TableElement Code="1310-2" DisplayName="Oklahoma Kiowa" Source="HL7"/>
                <TableElement Code="1361-5" DisplayName="Oklahoma Miami" Source="HL7"/>
                <TableElement Code="1414-2" DisplayName="Oklahoma Ottawa" Source="HL7"/>
                <TableElement Code="1446-4" DisplayName="Oklahoma Pawnee" Source="HL7"/>
                <TableElement Code="1451-4" DisplayName="Oklahoma Peoria" Source="HL7"/>
                <TableElement Code="1476-1" DisplayName="Oklahoma Ponca" Source="HL7"/>
                <TableElement Code="1554-5" DisplayName="Oklahoma Sac and Fox" Source="HL7"/>
                <TableElement Code="1571-9" DisplayName="Oklahoma Seminole" Source="HL7"/>
                <TableElement Code="1998-4" DisplayName="Old Harbor" Source="HL7"/>
                <TableElement Code="1403-5" DisplayName="Omaha" Source="HL7"/>
                <TableElement Code="1288-0" DisplayName="Oneida" Source="HL7"/>
                <TableElement Code="1289-8" DisplayName="Onondaga" Source="HL7"/>
                <TableElement Code="1140-3" DisplayName="Ontonagon" Source="HL7"/>
                <TableElement Code="1405-0" DisplayName="Oregon Athabaskan" Source="HL7"/>
                <TableElement Code="1407-6" DisplayName="Osage" Source="HL7"/>
                <TableElement Code="1944-8" DisplayName="Oscarville" Source="HL7"/>
                <TableElement Code="2500-7" DisplayName="Other Pacific Islander" Source="HL7"/>
                <TableElement Code="2131-1" DisplayName="Other Race" Source="HL7"/>
                <TableElement Code="1409-2" DisplayName="Otoe-Missouria" Source="HL7"/>
                <TableElement Code="1411-8" DisplayName="Ottawa" Source="HL7"/>
                <TableElement Code="1999-2" DisplayName="Ouzinkie" Source="HL7"/>
                <TableElement Code="1430-8" DisplayName="Owens Valley" Source="HL7"/>
                <TableElement Code="1416-7" DisplayName="Paiute" Source="HL7"/>
                <TableElement Code="2044-6" DisplayName="Pakistani" Source="HL7"/>
                <TableElement Code="1333-4" DisplayName="Pala" Source="HL7"/>
                <TableElement Code="2091-7" DisplayName="Palauan" Source="HL7"/>
                <TableElement Code="2124-6" DisplayName="Palestinian" Source="HL7"/>
                <TableElement Code="1439-9" DisplayName="Pamunkey" Source="HL7"/>
                <TableElement Code="2160-0" DisplayName="Panamanian" Source="HL7"/>
                <TableElement Code="1592-5" DisplayName="Panamint" Source="HL7"/>
                <TableElement Code="2102-2" DisplayName="Papua New Guinean" Source="HL7"/>
                <TableElement Code="2171-7" DisplayName="Paraguayan" Source="HL7"/>
                <TableElement Code="1713-7" DisplayName="Pascua Yaqui" Source="HL7"/>
                <TableElement Code="1441-5" DisplayName="Passamaquoddy" Source="HL7"/>
                <TableElement Code="1242-7" DisplayName="Paugussett" Source="HL7"/>
                <TableElement Code="2018-0" DisplayName="Pauloff Harbor" Source="HL7"/>
                <TableElement Code="1334-2" DisplayName="Pauma" Source="HL7"/>
                <TableElement Code="1445-6" DisplayName="Pawnee" Source="HL7"/>
                <TableElement Code="1017-3" DisplayName="Payson Apache" Source="HL7"/>
                <TableElement Code="1335-9" DisplayName="Pechanga" Source="HL7"/>
                <TableElement Code="1789-7" DisplayName="Pedro Bay" Source="HL7"/>
                <TableElement Code="1828-3" DisplayName="Pelican" Source="HL7"/>
                <TableElement Code="1448-0" DisplayName="Penobscot" Source="HL7"/>
                <TableElement Code="1450-6" DisplayName="Peoria" Source="HL7"/>
                <TableElement Code="1453-0" DisplayName="Pequot" Source="HL7"/>
                <TableElement Code="1980-2" DisplayName="Perryville" Source="HL7"/>
                <TableElement Code="2172-5" DisplayName="Peruvian" Source="HL7"/>
                <TableElement Code="1829-1" DisplayName="Petersburg" Source="HL7"/>
                <TableElement Code="1499-3" DisplayName="Picuris" Source="HL7"/>
                <TableElement Code="1981-0" DisplayName="Pilot Point" Source="HL7"/>
                <TableElement Code="1945-5" DisplayName="Pilot Station" Source="HL7"/>
                <TableElement Code="1456-3" DisplayName="Pima" Source="HL7"/>
                <TableElement Code="1623-8" DisplayName="Pine Ridge Sioux" Source="HL7"/>
                <TableElement Code="1624-6" DisplayName="Pipestone Sioux" Source="HL7"/>
                <TableElement Code="1500-8" DisplayName="Piro" Source="HL7"/>
                <TableElement Code="1460-5" DisplayName="Piscataway" Source="HL7"/>
                <TableElement Code="1462-1" DisplayName="Pit River" Source="HL7"/>
                <TableElement Code="1946-3" DisplayName="Pitkas Point" Source="HL7"/>
                <TableElement Code="1947-1" DisplayName="Platinum" Source="HL7"/>
                <TableElement Code="1443-1" DisplayName="Pleasant Point Passamaquoddy" Source="HL7"/>
                <TableElement Code="1201-3" DisplayName="Poarch Band" Source="HL7"/>
                <TableElement Code="1243-5" DisplayName="Pocomoke Acohonock" Source="HL7"/>
                <TableElement Code="2094-1" DisplayName="Pohnpeian" Source="HL7"/>
                <TableElement Code="1876-2" DisplayName="Point Hope" Source="HL7"/>
                <TableElement Code="1877-0" DisplayName="Point Lay" Source="HL7"/>
                <TableElement Code="1501-6" DisplayName="Pojoaque" Source="HL7"/>
                <TableElement Code="1483-7" DisplayName="Pokagon Potawatomi" Source="HL7"/>
                <TableElement Code="2115-4" DisplayName="Polish" Source="HL7"/>
                <TableElement Code="2078-4" DisplayName="Polynesian" Source="HL7"/>
                <TableElement Code="1464-7" DisplayName="Pomo" Source="HL7"/>
                <TableElement Code="1474-6" DisplayName="Ponca" Source="HL7"/>
                <TableElement Code="1328-4" DisplayName="Poospatuck" Source="HL7"/>
                <TableElement Code="1315-1" DisplayName="Port Gamble Klallam" Source="HL7"/>
                <TableElement Code="1988-5" DisplayName="Port Graham" Source="HL7"/>
                <TableElement Code="1982-8" DisplayName="Port Heiden" Source="HL7"/>
                <TableElement Code="2000-8" DisplayName="Port Lions" Source="HL7"/>
                <TableElement Code="1525-5" DisplayName="Port Madison" Source="HL7"/>
                <TableElement Code="1948-9" DisplayName="Portage Creek" Source="HL7"/>
                <TableElement Code="1478-7" DisplayName="Potawatomi" Source="HL7"/>
                <TableElement Code="1487-8" DisplayName="Powhatan" Source="HL7"/>
                <TableElement Code="1484-5" DisplayName="Prairie Band" Source="HL7"/>
                <TableElement Code="1625-3" DisplayName="Prairie Island Sioux" Source="HL7"/>
                <TableElement Code="1202-1" DisplayName="Principal Creek Indian Nation" Source="HL7"/>
                <TableElement Code="1626-1" DisplayName="Prior Lake Sioux" Source="HL7"/>
                <TableElement Code="1489-4" DisplayName="Pueblo" Source="HL7"/>
                <TableElement Code="2180-8" DisplayName="Puerto Rican" Source="HL7"/>
                <TableElement Code="1518-0" DisplayName="Puget Sound Salish" Source="HL7"/>
                <TableElement Code="1526-3" DisplayName="Puyallup" Source="HL7"/>
                <TableElement Code="1431-6" DisplayName="Pyramid Lake" Source="HL7"/>
                <TableElement Code="2019-8" DisplayName="Qagan Toyagungin" Source="HL7"/>
                <TableElement Code="2020-6" DisplayName="Qawalangin" Source="HL7"/>
                <TableElement Code="1541-2" DisplayName="Quapaw" Source="HL7"/>
                <TableElement Code="1730-1" DisplayName="Quechan" Source="HL7"/>
                <TableElement Code="1084-3" DisplayName="Quileute" Source="HL7"/>
                <TableElement Code="1543-8" DisplayName="Quinault" Source="HL7"/>
                <TableElement Code="1949-7" DisplayName="Quinhagak" Source="HL7"/>
                <TableElement Code="1000-9" DisplayName="Race" Source="HL7"/>
                <TableElement Code="1385-4" DisplayName="Ramah Navajo" Source="HL7"/>
                <TableElement Code="1790-5" DisplayName="Rampart" Source="HL7"/>
                <TableElement Code="1219-5" DisplayName="Rampough Mountain" Source="HL7"/>
                <TableElement Code="1545-3" DisplayName="Rappahannock" Source="HL7"/>
                <TableElement Code="1141-1" DisplayName="Red Cliff Chippewa" Source="HL7"/>
                <TableElement Code="1950-5" DisplayName="Red Devil" Source="HL7"/>
                <TableElement Code="1142-9" DisplayName="Red Lake Chippewa" Source="HL7"/>
                <TableElement Code="1061-1" DisplayName="Red Wood" Source="HL7"/>
                <TableElement Code="1547-9" DisplayName="Reno-Sparks" Source="HL7"/>
                <TableElement Code="1151-0" DisplayName="Rocky Boy's Chippewa Cree" Source="HL7"/>
                <TableElement Code="1627-9" DisplayName="Rosebud Sioux" Source="HL7"/>
                <TableElement Code="1549-5" DisplayName="Round Valley" Source="HL7"/>
                <TableElement Code="1791-3" DisplayName="Ruby" Source="HL7"/>
                <TableElement Code="1593-3" DisplayName="Ruby Valley" Source="HL7"/>
                <TableElement Code="1551-1" DisplayName="Sac and Fox" Source="HL7"/>
                <TableElement Code="1143-7" DisplayName="Saginaw Chippewa" Source="HL7"/>
                <TableElement Code="2095-8" DisplayName="Saipanese" Source="HL7"/>
                <TableElement Code="1792-1" DisplayName="Salamatof" Source="HL7"/>
                <TableElement Code="1556-0" DisplayName="Salinan" Source="HL7"/>
                <TableElement Code="1558-6" DisplayName="Salish" Source="HL7"/>
                <TableElement Code="1560-2" DisplayName="Salish and Kootenai" Source="HL7"/>
                <TableElement Code="1458-9" DisplayName="Salt River Pima-Maricopa" Source="HL7"/>
                <TableElement Code="2161-8" DisplayName="Salvadoran" Source="HL7"/>
                <TableElement Code="1527-1" DisplayName="Samish" Source="HL7"/>
                <TableElement Code="2080-0" DisplayName="Samoan" Source="HL7"/>
                <TableElement Code="1018-1" DisplayName="San Carlos Apache" Source="HL7"/>
                <TableElement Code="1502-4" DisplayName="San Felipe" Source="HL7"/>
                <TableElement Code="1503-2" DisplayName="San Ildefonso" Source="HL7"/>
                <TableElement Code="1506-5" DisplayName="San Juan" Source="HL7"/>
                <TableElement Code="1505-7" DisplayName="San Juan De" Source="HL7"/>
                <TableElement Code="1504-0" DisplayName="San Juan Pueblo" Source="HL7"/>
                <TableElement Code="1432-4" DisplayName="San Juan Southern Paiute" Source="HL7"/>
                <TableElement Code="1574-3" DisplayName="San Manual" Source="HL7"/>
                <TableElement Code="1229-4" DisplayName="San Pasqual" Source="HL7"/>
                <TableElement Code="1656-8" DisplayName="San Xavier" Source="HL7"/>
                <TableElement Code="1220-3" DisplayName="Sand Hill" Source="HL7"/>
                <TableElement Code="2023-0" DisplayName="Sand Point" Source="HL7"/>
                <TableElement Code="1507-3" DisplayName="Sandia" Source="HL7"/>
                <TableElement Code="1628-7" DisplayName="Sans Arc Sioux" Source="HL7"/>
                <TableElement Code="1508-1" DisplayName="Santa Ana" Source="HL7"/>
                <TableElement Code="1509-9" DisplayName="Santa Clara" Source="HL7"/>
                <TableElement Code="1062-9" DisplayName="Santa Rosa" Source="HL7"/>
                <TableElement Code="1050-4" DisplayName="Santa Rosa Cahuilla" Source="HL7"/>
                <TableElement Code="1163-5" DisplayName="Santa Ynez" Source="HL7"/>
                <TableElement Code="1230-2" DisplayName="Santa Ysabel" Source="HL7"/>
                <TableElement Code="1629-5" DisplayName="Santee Sioux" Source="HL7"/>
                <TableElement Code="1510-7" DisplayName="Santo Domingo" Source="HL7"/>
                <TableElement Code="1528-9" DisplayName="Sauk-Suiattle" Source="HL7"/>
                <TableElement Code="1145-2" DisplayName="Sault Ste. Marie Chippewa" Source="HL7"/>
                <TableElement Code="1893-7" DisplayName="Savoonga" Source="HL7"/>
                <TableElement Code="1830-9" DisplayName="Saxman" Source="HL7"/>
                <TableElement Code="1952-1" DisplayName="Scammon Bay" Source="HL7"/>
                <TableElement Code="1562-8" DisplayName="Schaghticoke" Source="HL7"/>
                <TableElement Code="1564-4" DisplayName="Scott Valley" Source="HL7"/>
                <TableElement Code="2116-2" DisplayName="Scottish" Source="HL7"/>
                <TableElement Code="1470-4" DisplayName="Scotts Valley" Source="HL7"/>
                <TableElement Code="1878-8" DisplayName="Selawik" Source="HL7"/>
                <TableElement Code="1793-9" DisplayName="Seldovia" Source="HL7"/>
                <TableElement Code="1657-6" DisplayName="Sells" Source="HL7"/>
                <TableElement Code="1566-9" DisplayName="Seminole" Source="HL7"/>
                <TableElement Code="1290-6" DisplayName="Seneca" Source="HL7"/>
                <TableElement Code="1291-4" DisplayName="Seneca Nation" Source="HL7"/>
                <TableElement Code="1292-2" DisplayName="Seneca-Cayuga" Source="HL7"/>
                <TableElement Code="1573-5" DisplayName="Serrano" Source="HL7"/>
                <TableElement Code="1329-2" DisplayName="Setauket" Source="HL7"/>
                <TableElement Code="1795-4" DisplayName="Shageluk" Source="HL7"/>
                <TableElement Code="1879-6" DisplayName="Shaktoolik" Source="HL7"/>
                <TableElement Code="1576-8" DisplayName="Shasta" Source="HL7"/>
                <TableElement Code="1578-4" DisplayName="Shawnee" Source="HL7"/>
                <TableElement Code="1953-9" DisplayName="Sheldon's Point" Source="HL7"/>
                <TableElement Code="1582-6" DisplayName="Shinnecock" Source="HL7"/>
                <TableElement Code="1880-4" DisplayName="Shishmaref" Source="HL7"/>
                <TableElement Code="1584-2" DisplayName="Shoalwater Bay" Source="HL7"/>
                <TableElement Code="1586-7" DisplayName="Shoshone" Source="HL7"/>
                <TableElement Code="1602-2" DisplayName="Shoshone Paiute" Source="HL7"/>
                <TableElement Code="1881-2" DisplayName="Shungnak" Source="HL7"/>
                <TableElement Code="1891-1" DisplayName="Siberian Eskimo" Source="HL7"/>
                <TableElement Code="1894-5" DisplayName="Siberian Yupik" Source="HL7"/>
                <TableElement Code="1607-1" DisplayName="Siletz" Source="HL7"/>
                <TableElement Code="2051-1" DisplayName="Singaporean" Source="HL7"/>
                <TableElement Code="1609-7" DisplayName="Sioux" Source="HL7"/>
                <TableElement Code="1631-1" DisplayName="Sisseton Sioux" Source="HL7"/>
                <TableElement Code="1630-3" DisplayName="Sisseton-Wahpeton" Source="HL7"/>
                <TableElement Code="1831-7" DisplayName="Sitka" Source="HL7"/>
                <TableElement Code="1643-6" DisplayName="Siuslaw" Source="HL7"/>
                <TableElement Code="1529-7" DisplayName="Skokomish" Source="HL7"/>
                <TableElement Code="1594-1" DisplayName="Skull Valley" Source="HL7"/>
                <TableElement Code="1530-5" DisplayName="Skykomish" Source="HL7"/>
                <TableElement Code="1794-7" DisplayName="Slana" Source="HL7"/>
                <TableElement Code="1954-7" DisplayName="Sleetmute" Source="HL7"/>
                <TableElement Code="1531-3" DisplayName="Snohomish" Source="HL7"/>
                <TableElement Code="1532-1" DisplayName="Snoqualmie" Source="HL7"/>
                <TableElement Code="1336-7" DisplayName="Soboba" Source="HL7"/>
                <TableElement Code="1146-0" DisplayName="Sokoagon Chippewa" Source="HL7"/>
                <TableElement Code="1882-0" DisplayName="Solomon" Source="HL7"/>
                <TableElement Code="2103-0" DisplayName="Solomon Islander" Source="HL7"/>
                <TableElement Code="2165-9" DisplayName="South American" Source="HL7"/>
                <TableElement Code="1073-6" DisplayName="South American Indian" Source="HL7"/>
                <TableElement Code="2175-8" DisplayName="South American Indian" Source="HL7"/>
                <TableElement Code="1595-8" DisplayName="South Fork Shoshone" Source="HL7"/>
                <TableElement Code="2024-8" DisplayName="South Naknek" Source="HL7"/>
                <TableElement Code="1811-9" DisplayName="Southeast Alaska" Source="HL7"/>
                <TableElement Code="1244-3" DisplayName="Southeastern Indians" Source="HL7"/>
                <TableElement Code="1023-1" DisplayName="Southern Arapaho" Source="HL7"/>
                <TableElement Code="1104-9" DisplayName="Southern Cheyenne" Source="HL7"/>
                <TableElement Code="1433-2" DisplayName="Southern Paiute" Source="HL7"/>
                <TableElement Code="2137-8" DisplayName="Spaniard" Source="HL7"/>
                <TableElement Code="1074-4" DisplayName="Spanish American Indian" Source="HL7"/>
                <TableElement Code="2146-9" DisplayName="Spanish Basque" Source="HL7"/>
                <TableElement Code="1632-9" DisplayName="Spirit Lake Sioux" Source="HL7"/>
                <TableElement Code="1645-1" DisplayName="Spokane" Source="HL7"/>
                <TableElement Code="1533-9" DisplayName="Squaxin Island" Source="HL7"/>
                <TableElement Code="2045-3" DisplayName="Sri Lankan" Source="HL7"/>
                <TableElement Code="1144-5" DisplayName="St. Croix Chippewa" Source="HL7"/>
                <TableElement Code="2021-4" DisplayName="St. George" Source="HL7"/>
                <TableElement Code="1963-8" DisplayName="St. Mary's" Source="HL7"/>
                <TableElement Code="1951-3" DisplayName="St. Michael" Source="HL7"/>
                <TableElement Code="2022-2" DisplayName="St. Paul" Source="HL7"/>
                <TableElement Code="1633-7" DisplayName="Standing Rock Sioux" Source="HL7"/>
                <TableElement Code="1203-9" DisplayName="Star Clan of Muscogee Creeks" Source="HL7"/>
                <TableElement Code="1955-4" DisplayName="Stebbins" Source="HL7"/>
                <TableElement Code="1534-7" DisplayName="Steilacoom" Source="HL7"/>
                <TableElement Code="1796-2" DisplayName="Stevens" Source="HL7"/>
                <TableElement Code="1647-7" DisplayName="Stewart" Source="HL7"/>
                <TableElement Code="1535-4" DisplayName="Stillaguamish" Source="HL7"/>
                <TableElement Code="1649-3" DisplayName="Stockbridge" Source="HL7"/>
                <TableElement Code="1797-0" DisplayName="Stony River" Source="HL7"/>
                <TableElement Code="1471-2" DisplayName="Stonyford" Source="HL7"/>
                <TableElement Code="2002-4" DisplayName="Sugpiaq" Source="HL7"/>
                <TableElement Code="1472-0" DisplayName="Sulphur Bank" Source="HL7"/>
                <TableElement Code="1434-0" DisplayName="Summit Lake" Source="HL7"/>
                <TableElement Code="2004-0" DisplayName="Suqpigaq" Source="HL7"/>
                <TableElement Code="1536-2" DisplayName="Suquamish" Source="HL7"/>
                <TableElement Code="1651-9" DisplayName="Susanville" Source="HL7"/>
                <TableElement Code="1245-0" DisplayName="Susquehanock" Source="HL7"/>
                <TableElement Code="1537-0" DisplayName="Swinomish" Source="HL7"/>
                <TableElement Code="1231-0" DisplayName="Sycuan" Source="HL7"/>
                <TableElement Code="2125-3" DisplayName="Syrian" Source="HL7"/>
                <TableElement Code="1705-3" DisplayName="Table Bluff" Source="HL7"/>
                <TableElement Code="1719-4" DisplayName="Tachi" Source="HL7"/>
                <TableElement Code="2081-8" DisplayName="Tahitian" Source="HL7"/>
                <TableElement Code="2035-4" DisplayName="Taiwanese" Source="HL7"/>
                <TableElement Code="1063-7" DisplayName="Takelma" Source="HL7"/>
                <TableElement Code="1798-8" DisplayName="Takotna" Source="HL7"/>
                <TableElement Code="1397-9" DisplayName="Talakamish" Source="HL7"/>
                <TableElement Code="1799-6" DisplayName="Tanacross" Source="HL7"/>
                <TableElement Code="1800-2" DisplayName="Tanaina" Source="HL7"/>
                <TableElement Code="1801-0" DisplayName="Tanana" Source="HL7"/>
                <TableElement Code="1802-8" DisplayName="Tanana Chiefs" Source="HL7"/>
                <TableElement Code="1511-5" DisplayName="Taos" Source="HL7"/>
                <TableElement Code="1969-5" DisplayName="Tatitlek" Source="HL7"/>
                <TableElement Code="1803-6" DisplayName="Tazlina" Source="HL7"/>
                <TableElement Code="1804-4" DisplayName="Telida" Source="HL7"/>
                <TableElement Code="1883-8" DisplayName="Teller" Source="HL7"/>
                <TableElement Code="1338-3" DisplayName="Temecula" Source="HL7"/>
                <TableElement Code="1596-6" DisplayName="Te-Moak Western Shoshone" Source="HL7"/>
                <TableElement Code="1832-5" DisplayName="Tenakee Springs" Source="HL7"/>
                <TableElement Code="1398-7" DisplayName="Tenino" Source="HL7"/>
                <TableElement Code="1512-3" DisplayName="Tesuque" Source="HL7"/>
                <TableElement Code="1805-1" DisplayName="Tetlin" Source="HL7"/>
                <TableElement Code="1634-5" DisplayName="Teton Sioux" Source="HL7"/>
                <TableElement Code="1513-1" DisplayName="Tewa" Source="HL7"/>
                <TableElement Code="1307-8" DisplayName="Texas Kickapoo" Source="HL7"/>
                <TableElement Code="2046-1" DisplayName="Thai" Source="HL7"/>
                <TableElement Code="1204-7" DisplayName="Thlopthlocco" Source="HL7"/>
                <TableElement Code="1514-9" DisplayName="Tigua" Source="HL7"/>
                <TableElement Code="1399-5" DisplayName="Tillamook" Source="HL7"/>
                <TableElement Code="1597-4" DisplayName="Timbi-Sha Shoshone" Source="HL7"/>
                <TableElement Code="1833-3" DisplayName="Tlingit" Source="HL7"/>
                <TableElement Code="1813-5" DisplayName="Tlingit-Haida" Source="HL7"/>
                <TableElement Code="2073-5" DisplayName="Tobagoan" Source="HL7"/>
                <TableElement Code="1956-2" DisplayName="Togiak" Source="HL7"/>
                <TableElement Code="1653-5" DisplayName="Tohono O'Odham" Source="HL7"/>
                <TableElement Code="1806-9" DisplayName="Tok" Source="HL7"/>
                <TableElement Code="2083-4" DisplayName="Tokelauan" Source="HL7"/>
                <TableElement Code="1957-0" DisplayName="Toksook" Source="HL7"/>
                <TableElement Code="1659-2" DisplayName="Tolowa" Source="HL7"/>
                <TableElement Code="1293-0" DisplayName="Tonawanda Seneca" Source="HL7"/>
                <TableElement Code="2082-6" DisplayName="Tongan" Source="HL7"/>
                <TableElement Code="1661-8" DisplayName="Tonkawa" Source="HL7"/>
                <TableElement Code="1051-2" DisplayName="Torres-Martinez" Source="HL7"/>
                <TableElement Code="2074-3" DisplayName="Trinidadian" Source="HL7"/>
                <TableElement Code="1272-4" DisplayName="Trinity" Source="HL7"/>
                <TableElement Code="1837-4" DisplayName="Tsimshian" Source="HL7"/>
                <TableElement Code="1205-4" DisplayName="Tuckabachee" Source="HL7"/>
                <TableElement Code="1538-8" DisplayName="Tulalip" Source="HL7"/>
                <TableElement Code="1720-2" DisplayName="Tule River" Source="HL7"/>
                <TableElement Code="1958-8" DisplayName="Tulukskak" Source="HL7"/>
                <TableElement Code="1246-8" DisplayName="Tunica Biloxi" Source="HL7"/>
                <TableElement Code="1959-6" DisplayName="Tuntutuliak" Source="HL7"/>
                <TableElement Code="1960-4" DisplayName="Tununak" Source="HL7"/>
                <TableElement Code="1147-8" DisplayName="Turtle Mountain" Source="HL7"/>
                <TableElement Code="1294-8" DisplayName="Tuscarora" Source="HL7"/>
                <TableElement Code="1096-7" DisplayName="Tuscola" Source="HL7"/>
                <TableElement Code="1337-5" DisplayName="Twenty-Nine Palms" Source="HL7"/>
                <TableElement Code="1961-2" DisplayName="Twin Hills" Source="HL7"/>
                <TableElement Code="1635-2" DisplayName="Two Kettle Sioux" Source="HL7"/>
                <TableElement Code="1663-4" DisplayName="Tygh" Source="HL7"/>
                <TableElement Code="1807-7" DisplayName="Tyonek" Source="HL7"/>
                <TableElement Code="1970-3" DisplayName="Ugashik" Source="HL7"/>
                <TableElement Code="1672-5" DisplayName="Uintah Ute" Source="HL7"/>
                <TableElement Code="1665-9" DisplayName="Umatilla" Source="HL7"/>
                <TableElement Code="1964-6" DisplayName="Umkumiate" Source="HL7"/>
                <TableElement Code="1667-5" DisplayName="Umpqua" Source="HL7"/>
                <TableElement Code="1884-6" DisplayName="Unalakleet" Source="HL7"/>
                <TableElement Code="2025-5" DisplayName="Unalaska" Source="HL7"/>
                <TableElement Code="2006-5" DisplayName="Unangan Aleut" Source="HL7"/>
                <TableElement Code="2026-3" DisplayName="Unga" Source="HL7"/>
                <TableElement Code="1097-5" DisplayName="United Keetowah Band of Cherokee" Source="HL7"/>
                <TableElement Code="1118-9" DisplayName="Upper Chinook" Source="HL7"/>
                <TableElement Code="1636-0" DisplayName="Upper Sioux" Source="HL7"/>
                <TableElement Code="1539-6" DisplayName="Upper Skagit" Source="HL7"/>
                <TableElement Code="2173-3" DisplayName="Uruguayan" Source="HL7"/>
                <TableElement Code="1670-9" DisplayName="Ute" Source="HL7"/>
                <TableElement Code="1673-3" DisplayName="Ute Mountain Ute" Source="HL7"/>
                <TableElement Code="1435-7" DisplayName="Utu Utu Gwaitu Paiute" Source="HL7"/>
                <TableElement Code="2144-4" DisplayName="Valencian" Source="HL7"/>
                <TableElement Code="1808-5" DisplayName="Venetie" Source="HL7"/>
                <TableElement Code="2174-1" DisplayName="Venezuelan" Source="HL7"/>
                <TableElement Code="2047-9" DisplayName="Vietnamese" Source="HL7"/>
                <TableElement Code="1247-6" DisplayName="Waccamaw-Siousan" Source="HL7"/>
                <TableElement Code="1637-8" DisplayName="Wahpekute Sioux" Source="HL7"/>
                <TableElement Code="1638-6" DisplayName="Wahpeton Sioux" Source="HL7"/>
                <TableElement Code="1675-8" DisplayName="Wailaki" Source="HL7"/>
                <TableElement Code="1885-3" DisplayName="Wainwright" Source="HL7"/>
                <TableElement Code="1119-7" DisplayName="Wakiakum Chinook" Source="HL7"/>
                <TableElement Code="1886-1" DisplayName="Wales" Source="HL7"/>
                <TableElement Code="1436-5" DisplayName="Walker River" Source="HL7"/>
                <TableElement Code="1677-4" DisplayName="Walla-Walla" Source="HL7"/>
                <TableElement Code="1679-0" DisplayName="Wampanoag" Source="HL7"/>
                <TableElement Code="1064-5" DisplayName="Wappo" Source="HL7"/>
                <TableElement Code="1683-2" DisplayName="Warm Springs" Source="HL7"/>
                <TableElement Code="1685-7" DisplayName="Wascopum" Source="HL7"/>
                <TableElement Code="1598-2" DisplayName="Washakie" Source="HL7"/>
                <TableElement Code="1687-3" DisplayName="Washoe" Source="HL7"/>
                <TableElement Code="1639-4" DisplayName="Wazhaza Sioux" Source="HL7"/>
                <TableElement Code="1400-1" DisplayName="Wenatchee" Source="HL7"/>
                <TableElement Code="2075-0" DisplayName="West Indian" Source="HL7"/>
                <TableElement Code="1098-3" DisplayName="Western Cherokee" Source="HL7"/>
                <TableElement Code="1110-6" DisplayName="Western Chickahominy" Source="HL7"/>
                <TableElement Code="1273-2" DisplayName="Whilkut" Source="HL7"/>
                <TableElement Code="2106-3" DisplayName="White" Source="HL7"/>
                <TableElement Code="1148-6" DisplayName="White Earth" Source="HL7"/>
                <TableElement Code="1887-9" DisplayName="White Mountain" Source="HL7"/>
                <TableElement Code="1019-9" DisplayName="White Mountain Apache" Source="HL7"/>
                <TableElement Code="1888-7" DisplayName="White Mountain Inupiat" Source="HL7"/>
                <TableElement Code="1692-3" DisplayName="Wichita" Source="HL7"/>
                <TableElement Code="1248-4" DisplayName="Wicomico" Source="HL7"/>
                <TableElement Code="1120-5" DisplayName="Willapa Chinook" Source="HL7"/>
                <TableElement Code="1694-9" DisplayName="Wind River" Source="HL7"/>
                <TableElement Code="1024-9" DisplayName="Wind River Arapaho" Source="HL7"/>
                <TableElement Code="1599-0" DisplayName="Wind River Shoshone" Source="HL7"/>
                <TableElement Code="1696-4" DisplayName="Winnebago" Source="HL7"/>
                <TableElement Code="1700-4" DisplayName="Winnemucca" Source="HL7"/>
                <TableElement Code="1702-0" DisplayName="Wintun" Source="HL7"/>
                <TableElement Code="1485-2" DisplayName="Wisconsin Potawatomi" Source="HL7"/>
                <TableElement Code="1809-3" DisplayName="Wiseman" Source="HL7"/>
                <TableElement Code="1121-3" DisplayName="Wishram" Source="HL7"/>
                <TableElement Code="1704-6" DisplayName="Wiyot" Source="HL7"/>
                <TableElement Code="1834-1" DisplayName="Wrangell" Source="HL7"/>
                <TableElement Code="1295-5" DisplayName="Wyandotte" Source="HL7"/>
                <TableElement Code="1401-9" DisplayName="Yahooskin" Source="HL7"/>
                <TableElement Code="1707-9" DisplayName="Yakama" Source="HL7"/>
                <TableElement Code="1709-5" DisplayName="Yakama Cowlitz" Source="HL7"/>
                <TableElement Code="1835-8" DisplayName="Yakutat" Source="HL7"/>
                <TableElement Code="1065-2" DisplayName="Yana" Source="HL7"/>
                <TableElement Code="1640-2" DisplayName="Yankton Sioux" Source="HL7"/>
                <TableElement Code="1641-0" DisplayName="Yanktonai Sioux" Source="HL7"/>
                <TableElement Code="2098-2" DisplayName="Yapese" Source="HL7"/>
                <TableElement Code="1711-1" DisplayName="Yaqui" Source="HL7"/>
                <TableElement Code="1731-9" DisplayName="Yavapai" Source="HL7"/>
                <TableElement Code="1715-2" DisplayName="Yavapai Apache" Source="HL7"/>
                <TableElement Code="1437-3" DisplayName="Yerington Paiute" Source="HL7"/>
                <TableElement Code="1717-8" DisplayName="Yokuts" Source="HL7"/>
                <TableElement Code="1600-6" DisplayName="Yomba" Source="HL7"/>
                <TableElement Code="1722-8" DisplayName="Yuchi" Source="HL7"/>
                <TableElement Code="1066-0" DisplayName="Yuki" Source="HL7"/>
                <TableElement Code="1724-4" DisplayName="Yuman" Source="HL7"/>
                <TableElement Code="1896-0" DisplayName="Yupik Eskimo" Source="HL7"/>
                <TableElement Code="1732-7" DisplayName="Yurok" Source="HL7"/>
                <TableElement Code="2066-9" DisplayName="Zairean" Source="HL7"/>
                <TableElement Code="1515-6" DisplayName="Zia" Source="HL7"/>
                <TableElement Code="1516-4" DisplayName="Zuni" Source="HL7"/>
            </TableDefinition>
            <TableDefinition description="PH_AdministrativeSex_HL7_2x" Id="HL70001" Name="Administrative sex (HL7)">
                <TableElement Code="A" DisplayName="Ambiguous" Source="HL7"/>
                <TableElement Code="F" DisplayName="Female" Source="HL7"/>
                <TableElement Code="M" DisplayName="Male" Source="HL7"/>
                <TableElement Code="N" DisplayName="Not applicable" Source="HL7"/>
                <TableElement Code="O" DisplayName="Other" Source="HL7"/>
                <TableElement Code="U" DisplayName="Unknown" Source="HL7"/>
            </TableDefinition>
            <TableDefinition Codesys="PHVS_AdministrativeSex_HL7_2x" Id="PHVS_AdministrativeSex_HL7_2x" Name="Administrative Sex (HL7)" Oid="2.16.840.1.114222.4.11.927" Type="Local" Version="1">
                <TableElement Code="A" DisplayName="Ambiguous" Source="Local"/>
                <TableElement Code="F" DisplayName="Female" Source="Local"/>
                <TableElement Code="M" DisplayName="Male" Source="Local"/>
                <TableElement Code="N" DisplayName="Not applicable" Source="Local"/>
                <TableElement Code="O" DisplayName="Other" Source="Local"/>
                <TableElement Code="U" DisplayName="Unknown" Source="Local"/>
            </TableDefinition>
            <TableDefinition Codesys="PHVS_ObservationIdentifier_SyndromicSurveillance" Id="Observation Identifier (Syndromic Surveillance)" Name="Observation Identifier (Syndromic Surveillance)" Oid="2.16.840.1.114222.4.11.3589" Type="Local" Version="2">
                <TableElement Code="21612-7" DisplayName="Age Time Patient Reported" Source="Local"/>
                <TableElement Code="11289-6" DisplayName="Body temperature:Temp:Enctrfrst:Patient:Qn:" Source="Local"/>
                <TableElement Code="8661-1" DisplayName="Chief complaint:Find:Pt:Patient:Nom:Reported" Source="Local"/>
                <TableElement Code="44833-2" DisplayName="Diagnosis.preliminary:Imp:Pt:Patient:Nom:" Source="Local"/>
                <TableElement Code="SS003" DisplayName="Facility / Visit Type" Source="Local"/>
                <TableElement Code="11368-8" DisplayName="Illness or injury onset date and time:TmStp:Pt:Patient:Qn:" Source="Local"/>
                <TableElement Code="59408-5" DisplayName="Oxygen saturation:MFr:Pt:BldA:Qn:Pulse oximetry" Source="Local"/>
                <TableElement Code="SS001" DisplayName="Treating Facility Identifier" Source="Local"/>
                <TableElement Code="SS002" DisplayName="Treating Facility Location" Source="Local"/>
                <TableElement Code="54094-8" DisplayName="Triage note:Find:Pt:Emergency department:Doc:" Source="Local"/>
            </TableDefinition>
            <TableDefinition Codesys="PH_DischargeDisposition_HL7_2x" Id="HL70112" Name="Discharge disposition (HL7)" Oid="2.16.840.1.113883.12.112" Type="HL7" Version="HL7 v2.5">
                <TableElement Code="09" DisplayName="Admitted as an inpatient to this hospital" Source="HL7"/>
                <TableElement Code="01" DisplayName="Discharged to home or self care (routine discharge)" Source="HL7"/>
                <TableElement Code="66" DisplayName="Discharged/transferred to a Critical Access Hospital (CAH). (Effective 1/1/06)" Source="HL7"/>
                <TableElement Code="43" DisplayName="Discharged/transferred to a federal health care facility. (Effective 10/1/03)" Source="HL7"/>
                <TableElement Code="63" DisplayName="Discharged/transferred to a Medicare certified long term care hospital (LTCH).(Effective 5/9/02.)" Source="HL7"/>
                <TableElement Code="64" DisplayName="Discharged/transferred to a nursing facility certified under Medicaid but not certified under Medicare. (Effective 10/1/02.)" Source="HL7"/>
                <TableElement Code="65" DisplayName="Discharged/transferred to a psychiatric hospital or psychiatric distinct part unit of a hospital. (Effective 4/1/04)" Source="HL7"/>
                <TableElement Code="02" DisplayName="Discharged/transferred to a short-term general hospital for inpatient care" Source="HL7"/>
                <TableElement Code="62" DisplayName="Discharged/transferred to an inpatient rehabilitation facility (IRF) including rehabilitation distinct part units of a hospital. (Effective retroactive to 1/1/02.)" Source="HL7"/>
                <TableElement Code="04" DisplayName="Discharged/transferred to an intermediate care facility (ICF)" Source="HL7"/>
                <TableElement Code="05" DisplayName="Discharged/transferred to another type of institution not defined elsewhere in this code list" Source="HL7"/>
                <TableElement Code="08" DisplayName="Discharged/transferred to home under care of a Home IV provider" Source="HL7"/>
                <TableElement Code="06" DisplayName="Discharged/transferred to home under care of organized home health service organization" Source="HL7"/>
                <TableElement Code="61" DisplayName="Discharged/transferred to hospital-based Medicare approved swing bed" Source="HL7"/>
                <TableElement Code="03" DisplayName="Discharged/transferred to skilled nursing facility (SNF) with Medicare certification." Source="HL7"/>
                <TableElement Code="20" DisplayName="Expired" Source="HL7"/>
                <TableElement Code="42" DisplayName="Expired - place unknown" Source="HL7"/>
                <TableElement Code="40" DisplayName="Expired at home" Source="HL7"/>
                <TableElement Code="41" DisplayName="Expired in a medical facility (e.g. hospital, SNF, ICF, or free standing hospice)" Source="HL7"/>
                <TableElement Code="50" DisplayName="Hospice - home" Source="HL7"/>
                <TableElement Code="51" DisplayName="Hospice - medical facility" Source="HL7"/>
                <TableElement Code="07" DisplayName="Left against medical advice or discontinued care" Source="HL7"/>
                <TableElement Code="44-49" DisplayName="Reserved for national assignment" Source="HL7"/>
                <TableElement Code="52-60" DisplayName="Reserved for national assignment" Source="HL7"/>
                <TableElement Code="67-70" DisplayName="Reserved for national assignment" Source="HL7"/>
                <TableElement Code="73-99" DisplayName="Reserved for national assignment" Source="HL7"/>
                <TableElement Code="10-19" DisplayName="Reserved for national assignment (Discontinued effective 10/16/03)" Source="HL7"/>
                <TableElement Code="2l-29" DisplayName="Reserved for national assignment (Discontinued effective 10/16/03)" Source="HL7"/>
                <TableElement Code="31-39" DisplayName="Reserved for national assignment (Discontinued effective 10/16/03)" Source="HL7"/>
                <TableElement Code="71" DisplayName="Reserved for national assignment (Discontinued effective 4/1/03)" Source="HL7"/>
                <TableElement Code="72" DisplayName="Reserved for national assignment (Discontinued effective 4/1/03)" Source="HL7"/>
                <TableElement Code="30" DisplayName="Still Patient" Source="HL7"/>
            </TableDefinition>
            <TableDefinition IdNumber="0200" Type="HL7" Name="Name type" Id="HL70200" Codesys="HL7 v2.5.1">
                <TableElement Source="HL7 V2.5.1 " DisplayName="Alias Name" Code="A"/>
                <TableElement Source="HL7 V2.5.1 " DisplayName="Name at Birth" Code="B"/>
                <TableElement Source="HL7 V2.5.1 " DisplayName="Adopted Name" Code="C"/>
                <TableElement Source="HL7 V2.5.1 " DisplayName="Display Name" Code="D"/>
                <TableElement Source="HL7 V2.5.1 " DisplayName="Licensing Name" Code="I"/>
                <TableElement Source="HL7 V2.5.1 " DisplayName="Legal Name" Code="L"/>
                <TableElement Source="HL7 V2.5.1 " DisplayName="Maiden Name" Code="M"/>
                <TableElement Source="HL7 V2.5.1 " DisplayName="Nickname/ Call me Name/Street Name" Code="N"/>
                <TableElement Source="HL7 V2.5.1 " DisplayName="Name of Partner/Spouse (retained for backward compatibility only)" Code="P"/>
                <TableElement Source="HL7 V2.5.1 " DisplayName="Registered Name (animals only)" Code="R"/>
                <TableElement Source="HL7 V2.5.1 " DisplayName="Coded Pseudo-Name to ensure anonymity" Code="S"/>
                <TableElement Source="HL7 V2.5.1 " DisplayName="Indigenous/Tribal/Community Name" Code="T"/>
                <TableElement Source="HL7 V2.5.1 " DisplayName="Unspecified" Code="U"/>
            </TableDefinition>
            <TableDefinition description="PH_ImmunizationRegistryStatus_HL7_2x" Id="HL70441" Name="Immunization Registry Status (HL7)">
                <TableElement Code="A" DisplayName="Active" Source="HL7"/>
                <TableElement Code="I" DisplayName="Inactive" Source="HL7"/>
                <TableElement Code="L" DisplayName="Inactive - Lost to follow-up (cancel contract)" Source="HL7"/>
                <TableElement Code="M" DisplayName="Inactive - Moved or gone elsewhere (cancel contract)" Source="HL7"/>
                <TableElement Code="P" DisplayName="Inactive - Permanently inactive (Do not reactivate or add new entries to the record)" Source="HL7"/>
                <TableElement Code="O" DisplayName="Other" Source="HL7"/>
                <TableElement Code="U" DisplayName="Unknown" Source="HL7"/>
            </TableDefinition>
            <TableDefinition Codesys="PH_ObservationResultStatus_HL7_2x" Id="HL70085" Name="Observation result status (HL7)">
                <TableElement Code="D" DisplayName="Deletes the OBX record" Source="HL7"/>
                <TableElement Code="F" DisplayName="Final results; Can only be changed with a corrected result." Source="HL7"/>
                <TableElement Code="N" DisplayName="Not asked; used to affirmatively document that the observation identified in the OBX was not sought when the universal service ID in OBR-4 implies that it would be sought." Source="HL7"/>
                <TableElement Code="O" DisplayName="Order detail description only (no result)" Source="HL7"/>
                <TableElement Code="S" DisplayName="Partial results" Source="HL7"/>
                <TableElement Code="W" DisplayName="Post original as wrong, e.g., transmitted for wrong patient" Source="HL7"/>
                <TableElement Code="P" DisplayName="Preliminary results" Source="HL7"/>
                <TableElement Code="C" DisplayName="Record coming over is a correction and thus replaces a final result" Source="HL7"/>
                <TableElement Code="X" DisplayName="Results cannot be obtained for this observation" Source="HL7"/>
                <TableElement Code="R" DisplayName="Results entered -- not verified" Source="HL7"/>
                <TableElement Code="U" DisplayName="Results status change to final without retransmitting results already sent as _preliminary._  E.g., radiology changes status from preliminary to final" Source="HL7"/>
                <TableElement Code="I" DisplayName="Specimen in lab; results pending" Source="HL7"/>
            </TableDefinition>
        </Tables>
    </xsl:variable>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:format-trailing">
		<xsl:param name="value"/>
		<xsl:param name="padding"/>
		<xsl:value-of select="$value"/>
		<xsl:if test="$value != ''">
			<xsl:value-of select="$padding"/>
		</xsl:if>
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:format-with-space">
		<xsl:param name="value"/>
		<xsl:value-of select="util:format-trailing($value, ' ')"/>
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:format-tel">
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
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:format-address">
		<xsl:param name="street"/>
		<xsl:param name="city"/>
		<xsl:param name="state"/>
		<xsl:param name="zip"/>
		<xsl:param name="country"/>

		<xsl:value-of select="concat(util:format-with-space($street), util:format-with-space($city), util:format-with-space($state), util:format-with-space($zip), util:format-with-space($country))"/>

	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:tags">
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
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:tag">
		<xsl:param name="tag"/>		
		<xsl:param name="ind"/>
		
		<xsl:value-of select="concat($nl, $ind)"/>
		<xsl:text disable-output-escaping="yes">&lt;</xsl:text>
		<xsl:value-of select="$tag"/>
		<xsl:text disable-output-escaping="yes">&gt;</xsl:text>	
		
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:format-date">
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
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:start">
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
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:begin-obx-table">
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">				
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($nl, $ind, '{&quot;element&quot; : &quot;obx&quot;, &quot;data&quot; : ', $nl)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:end-obx-group">
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
	</xsl:function><xsl:variable xmlns:xalan="http://xml.apache.org/xslt" name="indent" select="'&#x9;'"/><xsl:variable xmlns:xalan="http://xml.apache.org/xslt" name="nl" select="'&#xA;'"/><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:title">
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
							<xsl:value-of select="util:end-tab($ind, $vertical-orientation)"/>
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
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:title-no-tab">
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
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:begin-tab">
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
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:end-tab">
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
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:elements">
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
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:message-elements">
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
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:end-obx-elements">
		<xsl:param name="ind"/>
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">	
				<xsl:variable name="end-elements">
					<xsl:value-of select="util:tag('/table', $ind)"/>
					<xsl:value-of select="util:tag('br/', $ind)"/>
					<xsl:value-of select="util:tag('/fieldset', $ind)"/>
					<xsl:value-of select="util:tag('/table', $ind)"/>
					<xsl:value-of select="util:end-tab($ind, $vertical-orientation)"/>
				</xsl:variable>
				<xsl:value-of select="$end-elements"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($ind, ']', $nl)"/> 
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:end-elements">
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
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:element">
		<xsl:param name="name"/>
		<xsl:param name="value"/>
		<xsl:param name="ind"/>
		<xsl:value-of select="util:element-with-delimiter($name, $value, ',', $ind)"/>
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:last-element">
		<xsl:param name="name"/>
		<xsl:param name="value"/>
		<xsl:param name="ind"/>
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">				
				<xsl:value-of select="util:element-with-delimiter($name, $value, '', $ind)"/>
				<xsl:value-of select="util:tag('/table', $ind)"/>
				<xsl:value-of select="util:end-tab($ind, $vertical-orientation)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat(util:element-with-delimiter($name, $value, '', $ind), $nl, $ind, $indent, ']', $nl)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:end-table">
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">				
				<xsl:value-of select="util:tag('/table', $ind)"/>
				<xsl:value-of select="util:tag('/br', $ind)"/>
			</xsl:when>
			<xsl:otherwise>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:single-element">
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
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:element-with-delimiter">
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
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:message-element-with-delimiter">
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
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:end">
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
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:blank-if-1">
		<xsl:param name="pos"/>
		<xsl:choose>
			<xsl:when test="$pos = 1">	
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$pos - 1"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:action-code">
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
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:admin-sex">
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
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:protection-indicator">
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
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:IfEmptyThenElse">
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
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:IfThenElse">
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
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:valueset">
		<xsl:param name="key"/>
		<xsl:param name="tablename"/>
		<xsl:value-of select="$HL7Tables/Tables/TableDefinition[@Id=$tablename]/TableElement[@Code=$key]/@DisplayName"/>
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:value-or-valueset">
		<xsl:param name="value"/>
		<xsl:param name="key"/>
		<xsl:param name="tablename"/>
		<xsl:choose>
			<xsl:when test="string-length(normalize-space($value)) = 0"> 
				<xsl:value-of select="util:valueset($key, $tablename)"/> 
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$value"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:strip-tabsets">
		<xsl:param name="html"/>
		
		<xsl:value-of select="replace(replace($html, '(&lt;tab heading=&quot;.*&quot;)|(&lt;tabset)|(&lt;accordion(-group)?)', '&lt;div'),                     '(&lt;/tab&gt;)|(&lt;/tabset&gt;)|(&lt;/accordion(-group)?&gt;)', '&lt;/div&gt;')"/>
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:segdesc">
		<xsl:param name="seg"/>
		<xsl:choose>
			<xsl:when test="$seg = 'PID' or $seg = 'QPD'">
				<xsl:value-of select="'Patient Information'"/>
			</xsl:when>
			<xsl:when test="$seg = 'PD1'">
				<xsl:value-of select="'Immunization Registry Information'"/>
			</xsl:when>
			<xsl:when test="$seg = 'PV1'">
				<xsl:value-of select="'Patient Visit Information'"/>
			</xsl:when>
			<xsl:when test="$seg = 'NK1'">
				<xsl:value-of select="'Guardian or Responsible Party'"/>
			</xsl:when>
			<xsl:when test="$seg = 'OBX'">
				<xsl:value-of select="'Observations'"/>
			</xsl:when>
			<xsl:when test="$seg = 'RXA'">
				<xsl:value-of select="'Vaccine Administration Information'"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="'Other'"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>


</xsl:stylesheet>