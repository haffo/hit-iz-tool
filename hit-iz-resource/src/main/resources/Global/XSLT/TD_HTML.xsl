<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xi="http://www.w3.org/2001/XInclude" xmlns:util="http://hl7.nist.gov/data-specs/util" exclude-result-prefixes="xs" version="2.0">
	<!-- param: output   values: json | jquery-tab-html | ng-tab-html    default: plain-html -->
	<!--xsl:param name="output" select="'json'" /-->
	<!--xsl:param name="output" select="'jquery-tab-html'" -->
	<!--xsl:param name="output" select="'plain-html'"/-->
	<xsl:param name="output" select="'ng-tab-html'"/>
	<xsl:variable name="version" select="'2.9.11'"/>
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- Release notes author:sriniadhi.work@gmail.com

	2.1:  Tabset support
	2.2:  Adding support for SS and major refactoring into imports and includes
	2.8:  Bugfixes for SS
	2.9:  Adding LRI support (.1 = fixed OBR.28[1], .2 bugfixes for SS, .3 LRI repeating elements .4: bug fix regarding repeating race/ethnicgroup/address) .5 added qpd.3.1 patient identifier, also fixing QPD.address info .6 more birth order stuff z22 as well
.7 fixed a bug in plain-html
.8 - Multiple birth indicator, Immunization Registry status
.9 LRI lab results
.10 added /.br/ for LRI NTE
.11 SS update for Observation Value condition

	-->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- character map is used for being able to output these special html entities directly after escaping -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
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
	<xsl:variable name="RSP" select="'RSP'"/>
	<xsl:variable name="SS" select="'SS'"/>
	<xsl:variable name="LRI" select="'LRI'"/>
	
	<xsl:variable name="br">
		<xsl:value-of select="util:tag('br/', '')"/>
	</xsl:variable>

	<!--  This is the example format for the JSON output -->
	<!-- Example format: { "tables": [ { "title": "Patient Information", "elements": 
		[ { "element" : "Patient Name", "data" : "Madelynn Ainsley" }, { "element" 
		: "Mother's Maiden Name", "data" : "Morgan" }, { "element" : "ID Number", 
		"data" : "A26376273 D26376273 " }, { "element" : "Date/Time of Birth", "data" 
		: "07/02/2015" }, ... ] }, ] }
	 -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!--  ROOT TEMPLATE. Call corresponding sub templates based on the output desired (parametrized) -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
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
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- This generates the structured DATA (json if output is 'json' and html if it is 'plain-html'. Note that the main-html/jquery-tab-html call this in return -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<xsl:template name="main">
		<!-- Add profile information if it is json -->
		<xsl:value-of select="util:start(name(.), 'test-data-specs-main')"/>
		<!-- - - - programatically determine if it is a VXU or a QBP - -->
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
		<xsl:variable name="message-type">
			<xsl:choose>
				<xsl:when test="starts-with(name(.), 'ADT_A0')">
					<xsl:value-of select="$SS"/>
				</xsl:when>
				<xsl:when test="starts-with(name(.), 'ACK')">
					<xsl:value-of select="$ACK"/>
				</xsl:when>
				<xsl:when test="starts-with(name(.), 'QBP')">
					<xsl:value-of select="$QBP"/>
				</xsl:when>
				<xsl:when test="starts-with(name(.), 'RSP')">
					<xsl:value-of select="$ACK"/>
				</xsl:when>
				<xsl:when test="starts-with(name(.), 'VXU')">
					<xsl:value-of select="$VXU"/>
				</xsl:when>
				<xsl:when test="starts-with(name(.), 'ORU')">
					<xsl:value-of select="$LRI"/>
				</xsl:when>
			</xsl:choose>
		</xsl:variable>
		<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
		<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
		<!-- - - - - - - -  QBP - - - - - - - - - - -->
		<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
		<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
		<xsl:if test="$message-type = $QBP">
			<xsl:call-template name="display-repeating-segment-in-accordion">
				<xsl:with-param name="segments" select="//QPD"/>
			</xsl:call-template>
		</xsl:if>
		<!-- - - - - - Acknolwedgement profiles: showing a template saying that it is supplied by the system- - - - - - - - - - - -->
		<xsl:if test="$message-type = $ACK or $message-type = $RSP">
			<xsl:value-of select="util:title('title', 'Patient Information', 'Patient Information', $ind1, false(), false(), false())"/>
			<xsl:value-of select="util:elements($ind1)"/>
			<xsl:value-of select="util:single-element('This information will be automatically supplied by the System', $ind1)"/>
			<xsl:value-of select="util:end-elements($ind1, false(), false())"/>
		</xsl:if>
		<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
		<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
		<!-- - - - - - VXU segments - - - - - - - - - - - - -->
		<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
		<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
		<xsl:if test="$message-type = $VXU">
			<!-- - - - - - Patient information  - - - - - - - - - - - -->
			<xsl:call-template name="display-repeating-segment-in-accordion">
				<xsl:with-param name="segments" select="//PID"/>
			</xsl:call-template>
			<!-- - - - - - Immunization Registry information - - - - - - - - - - - -->
			<xsl:call-template name="display-repeating-segment-in-accordion">
				<xsl:with-param name="segments" select="//PD1"/>
			</xsl:call-template>
			<xsl:call-template name="display-repeating-segment-in-accordion">
				<xsl:with-param name="segments" select="//NK1"/>
			</xsl:call-template>
			<!-- - - - - - Vaccine Administration Information - - - - - - - - -->
			<xsl:call-template name="display-repeating-segment-in-accordion">
				<xsl:with-param name="segments" select="//RXA"/>
			</xsl:call-template>
		</xsl:if>
		<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
		<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
		<!-- - - - - - Syndoromic segments - - - - - - - - - - - - -->
		<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
		<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
		<xsl:if test="$message-type = $SS">
			<!-- - - - - - Immunization Registry information - - - - - - - - - - - -->
			<xsl:call-template name="display-repeating-segment-in-accordion">
				<xsl:with-param name="segments" select="//PID"/>
				<xsl:with-param name="mode" select="'Syndromic'"/>
			</xsl:call-template>
			<xsl:call-template name="display-repeating-segment-in-accordion">
				<xsl:with-param name="segments" select="//PV1"/>
				<xsl:with-param name="mode" select="'Syndromic'"/>
			</xsl:call-template>
			<xsl:call-template name="display-repeating-segment-in-accordion">
				<xsl:with-param name="segments" select="//OBX"/>
				<xsl:with-param name="mode" select="'Syndromic'"/>
			</xsl:call-template>
		</xsl:if>
		<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
		<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
		<!-- - - - - - LRI display- - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
		<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
		<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
		<xsl:if test="$message-type = $LRI">
			<!-- - - - - - Immunization Registry information - - - - - - - - - - - -->
			<xsl:call-template name="display-repeating-segment-in-accordion">
				<xsl:with-param name="segments" select="//PID"/>
				<xsl:with-param name="mode" select="'LRI'"/>
			</xsl:call-template>
			<xsl:call-template name="display-repeating-segment-in-accordion">
				<xsl:with-param name="segments" select="//ORC"/>
				<xsl:with-param name="mode" select="'LRI'"/>
			</xsl:call-template>
		</xsl:if>
	</xsl:template>
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- Indentation values so that the output is readable -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<xsl:variable name="ind1" select="'&#x9;&#x9;'"/>
	<xsl:variable name="ind2" select="'&#x9;&#x9;&#x9;&#x9;&#x9;'"/>
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - display-segment-in-groups - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<xsl:template name="display-repeating-segment-in-accordion">
		<xsl:param name="segments"/>
		<xsl:param name="mode"/>
		<xsl:variable name="multiple-segs" as="xs:boolean">
			<xsl:value-of select="count($segments) &gt; 1"/>
		</xsl:variable>
		<xsl:if test="$multiple-segs">
			<xsl:value-of select="util:title('title', concat(util:segdesc(name($segments[1])), '[*]'),  concat(util:segdesc(name($segments[1])), '[*]'), $ind1, false(), false(), false())"/>
			<xsl:value-of select="util:tag('accordion', '')"/>
		</xsl:if>
		<xsl:for-each select="$segments">
			<xsl:variable name="index">
				<xsl:if test="$multiple-segs">
					<xsl:value-of select="concat(' - ', position())"/>
				</xsl:if>
			</xsl:variable>
			<xsl:call-template name="segments">
				<xsl:with-param name="vertical-orientation" as="xs:boolean" select="$multiple-segs"/>
				<xsl:with-param name="counter" select="$index"/>
				<xsl:with-param name="mode" select="$mode"/>
			</xsl:call-template>
		</xsl:for-each>
		<xsl:if test="$multiple-segs">
			<xsl:value-of select="util:tag('/accordion', '')"/>
			<xsl:value-of select="util:end-tab($ind1, false())"/>
		</xsl:if>
	</xsl:template>
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!--  since mode parameter cannot be dynamic, using this approach which simply expands with xsl:when and calls the segments with different modes as constants -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<xsl:template name="segments">
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:param name="counter"/>
		<xsl:param name="mode"/>
		<xsl:choose>
			<xsl:when test="$mode = ''">
				<xsl:apply-templates select=".">
					<xsl:with-param name="vertical-orientation" as="xs:boolean" select="$vertical-orientation"/>
					<xsl:with-param name="counter" select="$counter"/>
				</xsl:apply-templates>
			</xsl:when>
			<xsl:when test="$mode = 'Syndromic'">
				<xsl:apply-templates select="." mode="Syndromic">
					<xsl:with-param name="vertical-orientation" as="xs:boolean" select="$vertical-orientation"/>
					<xsl:with-param name="counter" select="$counter"/>
				</xsl:apply-templates>
			</xsl:when>
			<xsl:when test="$mode = 'LRI'">
				<xsl:apply-templates select="." mode="LRI">
					<xsl:with-param name="vertical-orientation" as="xs:boolean" select="$vertical-orientation"/>
					<xsl:with-param name="counter" select="$counter"/>
				</xsl:apply-templates>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - Patient information - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<xsl:template match="PID">
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:param name="counter"/>
		<xsl:value-of select="util:title('title', concat('Patient Information', $counter), 'Patient Information', $ind1, false(), $vertical-orientation, false())"/>
		<xsl:value-of select="util:elements($ind1)"/>
		<xsl:value-of select="util:element('Patient Name', concat(util:format-with-space(.//PID.5.2), util:format-with-space(.//PID.5.3),.//PID.5.1.1), $ind1)"/>
		<xsl:value-of select="util:element('Mother''s Maiden Name', concat(util:format-with-space(.//PID.6.2), .//PID.6.1.1), $ind1)"/>
		<xsl:value-of select="util:element('ID Number', concat(util:format-with-space(.//PID.3.1[1]), .//PID.3.1[2]), $ind1)"/>
		<xsl:value-of select="util:element('Date/Time of Birth',util:format-date(.//PID.7.1), $ind1)"/>
		<xsl:value-of select="util:element('Administrative Sex', util:admin-sex(.//PID.8), $ind1)"/>
		<xsl:for-each select="PID.11">
			<xsl:value-of select="util:element(concat('Patient Address', ' ', util:blank-if-1(position(), count(..//PID.11))), util:format-address(PID.11.1/PID.11.1.1, PID.11.3, PID.11.4, PID.11.5, PID.11.6), $ind1)"/>
		</xsl:for-each>
		<xsl:for-each select="PID.13">
			<xsl:choose>
				<xsl:when test="PID.13.2 = 'NET'">
					<xsl:value-of select="util:element('Email', PID.13.4, $ind1)"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="util:element('Local Number', util:format-tel(PID.13.6, PID.13.7), $ind1)"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:for-each>
		<xsl:for-each select="PID.10">
			<xsl:value-of select="util:element(concat('Race', util:blank-if-1(position(), count(..//PID.10))), .//PID.10.2, $ind1)"/>
		</xsl:for-each>
		<xsl:for-each select="PID.22">
			<xsl:value-of select="util:element(concat('Ethnic Group', util:blank-if-1(position(), count(..//PID.22))), .//PID.22.2, $ind1)"/>
		</xsl:for-each>
		<xsl:value-of select="util:element('Multiple Birth Indicator',util:yes-no(.//PID.24), $ind1)"/>
		<xsl:value-of select="util:last-element('Birth Order',.//PID.25, $ind1, $vertical-orientation, false())"/>
	</xsl:template>
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - Patient information for QPD - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<xsl:template match="QPD">
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:param name="counter"/>
		<xsl:value-of select="util:title('title', concat('Patient Information', $counter), 'Patient Information', $ind1, false(), $vertical-orientation, false())"/>
		<xsl:value-of select="util:elements($ind1)"/>
		<xsl:value-of select="util:element('Patient Name', concat(util:format-with-space (.//QPD.4.2), util:format-with-space(.//QPD.4.3), .//QPD.4.1.1), $ind1)"/>
		<xsl:value-of select="util:element('Mother''s Maiden Name', .//QPD.5.1.1, $ind1)"/>
		<xsl:value-of select="util:element('ID Number', concat(util:format-with-space (.//QPD.3.1[1]), .//QPD.3.1[2]), $ind1)"/>
		<xsl:value-of select="util:element('Date/Time of Birth', util:format-date (.//QPD.6.1), $ind1)"/>
		<xsl:value-of select="util:element('Sex', util:admin-sex(.//QPD.7), $ind1)"/>
		<xsl:value-of select="util:element('Patient Address', util:format-address(.//QPD.8.1.1, .//QPD.8.3, .//QPD.8.4, .//QPD.8.5, .//QPD.8.6), $ind1)"/>
		<xsl:value-of select="util:element('Patient Phone', util:format-tel (.//QPD.9.6, .//QPD.9.7), $ind1)"/>
		<xsl:value-of select="util:element('Birth Indicator',util:yes-no(.//QPD.10), $ind1)"/>
		<xsl:value-of select="util:last-element('Birth Order',.//QPD.11, $ind1, $vertical-orientation, false())"/>
	</xsl:template>
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - Immunization Registry information - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<xsl:template match="PD1">
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:param name="counter"/>
		<xsl:value-of select="util:title('title', concat('Immunization Registry Information', $counter), 'Immunization Registry Information', $ind1, true(), $vertical-orientation, false())"/>
		<xsl:value-of select="util:elements($ind1)"/>
		<xsl:value-of select="util:element('Immunization Registry Status', util:imm-reg-status(.//PD1.16), $ind1)"/>
		<xsl:value-of select="util:element('Immunization Registry Status Effective Date', util:format-date(.//PD1.17), $ind1)"/>
		<xsl:value-of select="util:element('Publicity Code', .//PD1.11.2, $ind1)"/>
		<xsl:value-of select="util:element('Publicity Code Effective Date', util:format-date(.//PD1.18), $ind1)"/>
		<xsl:value-of select="util:element('Protection Indicator', util:protection-indicator(.//PD1.12), $ind1)"/>
		<xsl:value-of select="util:last-element('Protection Indicator Effective Date', util:format-date(.//PD1.13), $ind1, $vertical-orientation, false())"/>
	</xsl:template>
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - Guardian or Responsible Party - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<xsl:template match="NK1">
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:param name="counter"/>
		<xsl:value-of select="util:title('title', concat('Guardian or Responsible Party', $counter), 'Guardian or Responsible Party', $ind1, true(), $vertical-orientation, false())"/>
		<xsl:value-of select="util:elements($ind1)"/>
		<xsl:value-of select="util:element('Name', concat(util:format-with-space(.//NK1.2.2), util:format-with-space(.//NK1.2.3), .//NK1.2.1.1), $ind1)"/>
		<xsl:value-of select="util:element('Relationship', .//NK1.3.2, $ind1)"/>
		<xsl:for-each select="NK1.4">
			<xsl:value-of select="util:element(concat('Address', util:blank-if-1(position(), count(..//NK1.4))), util:format-address(.//NK1.4.1.1, .//NK1.4.3, .//NK1.4.4, .//NK1.4.5, .//NK1.4.6), $ind1)"/>
		</xsl:for-each>
		<xsl:for-each select="NK1.5">
			<xsl:value-of select="util:element('Phone Number', util:format-tel(NK1.5.6, NK1.5.7), $ind1)"/>
		</xsl:for-each>
		<xsl:value-of select="util:end-elements($ind1, $vertical-orientation, false())"/>
	</xsl:template>
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - Patient information - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<xsl:template match="PID" mode="Syndromic">
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:param name="counter"/>
		<xsl:value-of select="util:title('title', concat('Patient Information', $counter), 'Patient Information', $ind1, false(), $vertical-orientation, false())"/>
		<xsl:value-of select="util:elements($ind1)"/>
		<xsl:value-of select="util:element('Name', util:valueset(.//PID.5[2]/PID.5.7, 'HL70200'), $ind1)"/>
		<xsl:value-of select="util:element('Sex', util:valueset(.//PID.8, 'PHVS_AdministrativeSex_HL7_2x'), $ind1)"/>
		<xsl:for-each select="PID.10">
			<xsl:value-of select="util:element(concat('Race', util:blank-if-1(position(), count(..//PID.10))), util:value-or-valueset(.//PID.10.2, .//PID.10.1, 'CDCREC'), $ind1)"/>
		</xsl:for-each>
		<xsl:for-each select="PID.22">
			<xsl:value-of select="util:element(concat('Ethnic Group', util:blank-if-1(position(), count(..//PID.22))), util:value-or-valueset(.//PID.22.2, .//PID.22.1, 'CDCREC'), $ind1)"/>
		</xsl:for-each>
		<xsl:value-of select="util:element('City', .//PID.11.3, $ind1)"/>
		<xsl:value-of select="util:element('State', util:valueset(.//PID.11.4, 'PHVS_State_FIPS_5-2'), $ind1)"/>
		<xsl:value-of select="util:element('Zip Code', .//PID.11.5, $ind1)"/>
		<xsl:value-of select="util:element('Country', util:valueset(//PID.11.6, 'PHVS_Country_ISO_3166-1'), $ind1)"/>
		<xsl:value-of select="util:element('County/Parish Code', .//PID.11.9, $ind1)"/>
		<xsl:if test="not(//MSH.9.2 = 'A01')">
			<xsl:value-of select="util:element('Patient Death  Date and Time', util:format-time(.//PID.29.1), $ind1)"/>
			<!-- - - - - - time? - - - - - - - - - - - -->
			<xsl:variable name="yes" as="xs:boolean" select=".//PID.30 = 'Y' or .//PID.30 = 'y'"/>
			<xsl:value-of select="util:element('Patient Death Indicator', util:IfThenElse($yes, 'Yes', .//PID.30), $ind1)"/>
		</xsl:if>
		<xsl:value-of select="util:end-elements($ind1, $vertical-orientation, false())"/>
	</xsl:template>
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - Patient information - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<xsl:template match="PID" mode="LRI">
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:param name="counter"/>
		<xsl:value-of select="util:title('title', concat('Patient Information', $counter), 'Patient Information', $ind1, false(), $vertical-orientation, false())"/>
		<xsl:value-of select="util:elements($ind1)"/>
		<xsl:value-of select="util:element('Name', concat(util:format-with-space(.//PID.5.2), util:format-with-space(.//PID.5.3), util:format-with-space(.//PID.5.1.1), .//PID.5.4), $ind1)"/>
		<xsl:value-of select="util:element('Date/Time of Birth',util:format-date(.//PID.7.1), $ind1)"/>
		<xsl:value-of select="util:element('Administrative Sex', util:admin-sex(.//PID.8), $ind1)"/>
		<xsl:for-each select="PID.10">
			<xsl:value-of select="util:element(concat('Race', util:blank-if-1-variant2(position(), count(..//PID.10))), .//PID.10.2, $ind1)"/>
			<xsl:value-of select="util:element(concat('Alt Race', util:blank-if-1-variant2(position(), count(..//PID.10))), .//PID.10.5, $ind1)"/>
		</xsl:for-each>
		<xsl:value-of select="util:end-elements($ind1, $vertical-orientation, false())"/>
	</xsl:template>
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - Patient Visit information - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<xsl:template match="PV1" mode="Syndromic">
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:param name="counter"/>
		<xsl:value-of select="util:title('title', concat('Visit Information', $counter), 'Visit Information', $ind1, false(), $vertical-orientation, false())"/>
		<xsl:value-of select="util:elements($ind1)"/>
		<xsl:message>
					<xsl:value-of select="'------------------------------------------'"/>
					<xsl:value-of select="..//PV2.3.2"/>
					<xsl:value-of select="'------------------------------------------'"/>
					</xsl:message>
		<xsl:variable name="encounter-reason">
			<xsl:choose>
				<xsl:when test="..//PV2.3.2  != ''">
					<xsl:value-of select="..//PV2.3.2"/>
				</xsl:when>
				<xsl:when test="..//PV2.3.3 = 'I9CDX'">
					<xsl:value-of select="util:valueset(..//PV2.3.1, 'PHVS_AdministrativeDiagnosis_CDC_ICD-9CM')"/>
				</xsl:when>
				<xsl:when test="..//PV2.3.3 = 'I10'">
					<xsl:value-of select="util:valueset(..//PV2.3.1, 'PHVS_CauseOfDeath_ICD-10_CDC ')"/>
				</xsl:when>
				<xsl:when test="..//PV2.3.3 = 'SCT'">
					<xsl:value-of select="util:valueset(..//PV2.3.1, 'PHVS_Disease_CDC')"/>
				</xsl:when>
			</xsl:choose>
		</xsl:variable>
		<xsl:value-of select="util:element('Admit or Encounter Reason', $encounter-reason, $ind1)"/>
		<xsl:value-of select="util:element('Admit Date and Time', util:format-time(.//PV1.44.1), $ind1)"/>
		<!-- - - - - - time? - - - - - - - - - - - -->
		<xsl:value-of select="util:element('Patient Class', util:valueset(.//PV1.2, 'PHVS_PatientClass_SyndromicSurveillance'), $ind1)"/>
		<xsl:if test="not(//MSH.9.2 = 'A01' or //MSH.9.2 = 'A04')">
			<xsl:value-of select="util:element('Discharge Disposition', util:valueset(.//PV1.36, 'HL70112'), $ind1)"/>
			<xsl:value-of select="util:element('Discharge Date/Time', util:format-time(.//PV1.45.1), $ind1)"/>
		</xsl:if>
		<xsl:value-of select="util:element('Diagnosis Type', util:valueset(..//DG1.6, 'HL70052'), $ind1)"/>
		<xsl:for-each select="..//DG1">
			<xsl:variable name="diagnosis">
				<xsl:choose>
					<xsl:when test=".//DG1.3.2  != ''">
						<xsl:value-of select=".//DG1.3.2"/>
					</xsl:when>
					<xsl:when test=".//DG1.3.3  = 'I9CDX'">
						<xsl:value-of select="util:valueset(.//DG1.3.1, 'PHVS_AdministrativeDiagnosis_CDC_ICD-9CM')"/>
					</xsl:when>
					<xsl:when test=".//DG1.3.3 = 'I10'">
						<xsl:value-of select="util:valueset(.//DG1.3.1, 'PHVS_CauseOfDeath_ICD-10_CDC ')"/>
					</xsl:when>
					<xsl:when test=".//DG1.3.3 = 'SCT'">
						<xsl:value-of select="util:valueset(.//DG1.3.1, 'PHVS_Disease_CDC')"/>
					</xsl:when>
				</xsl:choose>
			</xsl:variable>
			<xsl:value-of select="util:element('Diagnosis', $diagnosis, $ind1)"/>
		</xsl:for-each>
		<xsl:value-of select="util:end-elements($ind1, $vertical-orientation, false())"/>
	</xsl:template>
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - Vaccine Administration Information - - - - - - - - - - - -->
	<!-- Note the OBX subtable. Also, that the grouping based on OBX.4 -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<xsl:template match="RXA">
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:param name="counter"/>
		<xsl:value-of select="util:title('title', concat('Vaccine Administration Information', $counter), 'Vaccine Administration Information', $ind1, true(), $vertical-orientation, false())"/>
		<xsl:value-of select="util:elements($ind1)"/>
		<xsl:value-of select="util:element('Administered Vaccine', .//RXA.5.2, $ind1)"/>
		<xsl:value-of select="util:element('Date/Time Start of Administration', util:format-date(.//RXA.3.1), $ind1)"/>
		<xsl:value-of select="util:element('Administered Amount', .//RXA.6, $ind1)"/>
		<xsl:value-of select="util:element('Administered Units', .//RXA.7.2, $ind1)"/>
		<xsl:value-of select="util:element('Administration Notes',  .//RXA.9.2, $ind1)"/>
		<xsl:value-of select="util:element('Administering Provider', concat(util:format-with-space(.//RXA.10.3), .//RXA.10.2.1), $ind1)"/>
		<xsl:value-of select="util:element('Substance Lot Number', .//RXA.15, $ind1)"/>
		<xsl:value-of select="util:element('Substance Expiration Date', util:format-date(.//RXA.16.1), $ind1)"/>
		<xsl:value-of select="util:element('Substance Manufacturer Name', .//RXA.17.2, $ind1)"/>
		<xsl:value-of select="util:element('Substance/Treatment Refusal Reason', util:sub-refusal-reason(.//RXA.18.2), $ind1)"/>
		<xsl:value-of select="util:element('Completion Status', util:completion-status(.//RXA.20), $ind1)"/>
		<xsl:value-of select="util:element('Action Code', util:action-code(.//RXA.21), $ind1)"/>
		<xsl:value-of select="util:element('Route', ..//RXR.1.2, $ind1)"/>
		<xsl:value-of select="util:element('Administration Site', ..//RXR.2.2, $ind1)"/>
		<xsl:value-of select="util:element('Entering Organization', ..//ORC.17.2, $ind1)"/>
		<xsl:value-of select="util:element('Entered By', concat(util:format-with-space(..//ORC.10.3),..//ORC.10.2.1), $ind1)"/>
		<xsl:value-of select="util:element('Ordered By', concat(util:format-with-space(..//ORC.12.3),..//ORC.12.2.1), $ind1)"/>
		<xsl:choose>
			<xsl:when test="count(..//OBX) &gt; 0">
				<xsl:value-of select="util:end-table($ind1)"/>
				<xsl:value-of select="util:begin-sub-table($ind2)"/>
				<xsl:variable name="recordname" select="replace(.//RXA.9.2, '^(New immunization record)|(New record)$', 'Observations', 'i')"/>
				<xsl:value-of select="util:title-no-tab('title', $recordname, $recordname, $ind2, false())"/>
				<xsl:value-of select="util:elements($ind2)"/>
				<xsl:for-each-group select="..//OBX" group-by="OBX.4">
					<xsl:for-each select="current-group()">
						<xsl:apply-templates select="."/>
					</xsl:for-each>
					<!-- grey line after the group -->
					<xsl:if test="position () != last()">
						<xsl:value-of select="util:end-obx-group($ind2)"/>
					</xsl:if>
				</xsl:for-each-group>
				<xsl:choose>
					<xsl:when test="$generate-plain-html">
						<xsl:value-of select="util:end-sub-table($ind2, $vertical-orientation)"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="concat($nl, $indent, util:end-sub-table($ind2, $vertical-orientation), $ind2, '}', $nl, $ind2, '}', $nl, $ind1, ']', $nl)"/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="util:end-elements($ind1, $vertical-orientation, false())"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!--  Observation Table: The title is from RXA -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<xsl:template match="OBX">
		<xsl:variable name="obX.value">
			<xsl:choose>
				<xsl:when test=".//OBX.2= 'CE'">
					<xsl:value-of select=".//OBX.5.2"/>
				</xsl:when>
				<xsl:when test=".//OBX.2 = 'TS' or .//OBX.2 = 'DT'">
					<xsl:value-of select="util:format-date(.//OBX.5.1)"/>
				</xsl:when>
			</xsl:choose>
		</xsl:variable>
		<xsl:value-of select="util:element(.//OBX.3.2, $obX.value, $ind2)"/>
	</xsl:template>
	<xsl:template match="OBX" mode="Syndromic">
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:param name="counter"/>
		<xsl:value-of select="util:title('title', concat('Observation Results Information', $counter), 'Observation Results Information', $ind1, true(), $vertical-orientation, false())"/>
		<xsl:value-of select="util:elements($ind1)"/>
		<xsl:value-of select="util:element('Observation  Identifier', util:valueset(.//OBX.3.1, 'Observation Identifier Syndromic Surveillance'), $ind1)"/>
		<xsl:variable name="observation-value">
			<xsl:choose>
				<xsl:when test=".//OBX.3.1 = 'SS003' and (..//PV1.2 = 'O' or ..//PV1.2 = 'E' or ..//PV1.2 = 'I')">
					<xsl:value-of select="util:value-or-valueset(.//OBX.5.2, .//OBX.5.1, 'PHVS_FacilityVisitType_SyndromicSurveillance')"/>
				</xsl:when>
				<xsl:when test=".//OBX.3.1 = '72166-2'">
					<xsl:value-of select="util:value-or-valueset(.//OBX.5.2, .//OBX.5.1, 'PHVS_SmokingStatus_MU')"/>
				</xsl:when>
				<xsl:when test=".//OBX.3.1 = '56816-2'">
					<xsl:value-of select="util:value-or-valueset(.//OBX.5.2, .//OBX.5.1, 'NHSNHealthcareServiceLocationCode')"/>
				</xsl:when>
				<xsl:when test=".//OBX.3.1 = 'SS002'">
					<xsl:value-of select="concat(.//OBX.5.1, .//OBX.5.3, util:valueset(.//OBX.5.4, 'PHVS_State_FIPS_5-2'), .//OBX.5.5, util:valueset(.//OBX.5.6, 'PHVS_Country_ISO_3166-1'), .//OBX.5.9)"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select=".//OBX.5"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:value-of select="util:element('Observation Value', $observation-value, $ind1)"/>
		<xsl:variable name="units">
			<xsl:choose>
				<xsl:when test=".//OBX.3.1 = '21612-7'">
					<xsl:value-of select="util:value-or-valueset(.//OBX.6.2 , .//OBX.6.1, 'PHVS_AgeUnit_SyndromicSurveillance')"/>
				</xsl:when>
				<xsl:when test=".//OBX.3.1 = '8302-2'">
					<xsl:value-of select="util:value-or-valueset(.//OBX.6.2 , .//OBX.6.1, 'PHVS_HeightUnit_UCUM')"/>
				</xsl:when>
				<xsl:when test=".//OBX.3.1 = '3141-9'">
					<xsl:value-of select="util:value-or-valueset(.//OBX.6.2 , .//OBX.6.1, 'PHVS_WeightUnit_UCUM')"/>
				</xsl:when>
			</xsl:choose>
		</xsl:variable>
		<xsl:value-of select="util:element('Units', $units, $ind1)"/>
		<xsl:value-of select="util:last-element('Observation Results Status', util:valueset(.//OBX.11, 'HL70085'), $ind1, $vertical-orientation, false())"/>
		<!--filter mask="OBX.6.1" title="Units" codeSystems="PHVS_TemperatureUnit_UCUM:PHVS_PulseOximetryUnit_UCUM:PHVS_AgeUnit_SyndromicSurveillance"/-->
	</xsl:template>
	<xsl:template match="ORC" mode="LRI">
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:param name="counter"/>
		<xsl:value-of select="util:title('title', concat('Order Observation', $counter), 'Ordering Provider', $ind1, true(), $vertical-orientation, false())"/>
		<xsl:value-of select="util:elements($ind1)"/>
		<xsl:value-of select="util:element('Name', concat(util:format-with-space(.//ORC.12.2.6), util:format-with-space(.//ORC.12.2.3), util:format-with-space(.//ORC.12.2.4), util:format-with-space(.//ORC.12.2.2.1), .//ORC.12.2.5), $ind1)"/>
		<xsl:value-of select="util:element('Identifier number', .//ORC.12.1, $ind1)"/>
		<xsl:value-of select="util:end-table-fieldset($ind1)"/>
		<xsl:value-of select="util:begin-sub-table($ind2)"/>
		<xsl:value-of select="util:title-no-tab('title', 'Observation Details', 'Observation Details', $ind2, false())"/>
		<xsl:value-of select="util:elements($ind2)"/>
		<xsl:value-of select="util:single-element('Observation General Information', $ind1)"/>
		<xsl:value-of select="util:element('Placer Order Number', .//ORC.2.1, $ind1)"/>
		<xsl:value-of select="util:element('Filler Order Number', .//ORC.3.1, $ind1)"/>
		<xsl:value-of select="util:element('Placer Group Number', .//ORC.4.1, $ind1)"/>
		<xsl:value-of select="util:element(' ', ' ',  $ind1)"/>
		<xsl:value-of select="util:single-element('Parent Universal Service Identifier', $ind1)"/>
		<xsl:value-of select="util:element('Identifier', .//ORC.31.1, $ind1)"/>
		<xsl:value-of select="util:element('Text', .//ORC.31.2, $ind1)"/>
		<xsl:value-of select="util:element('Alt Identifier', .//ORC.31.4, $ind1)"/>
		<xsl:value-of select="util:element('Alt Text', .//ORC.31.5, $ind1)"/>
		<xsl:value-of select="util:element('Original Text', .//ORC.31.9, $ind1)"/>
		<xsl:value-of select="util:element(' ', ' ',  $ind1)"/>
		<xsl:value-of select="util:single-element('Observation Details', $ind1)"/>
		<xsl:value-of select="util:element('Universal Service Identifier', ..//OBR.4.2, $ind1)"/>
		<xsl:value-of select="util:element('Observation Date/Time', util:format-time(..//OBR.7.1), $ind1)"/>
		<xsl:value-of select="util:element('Observation end Date/Time', util:format-time(..//OBR.8.1), $ind1)"/>
		<xsl:value-of select="util:element('Specimen Action Code', ..//OBR.11, $ind1)"/>
		<xsl:value-of select="util:element('Relevant Clinical Information', ..//OBR.13.2, $ind1)"/>
		<xsl:value-of select="util:element('Relevant Clinical Information Original Text', ..//OBR.13.9, $ind1)"/>
		<xsl:value-of select="util:element(' ', ' ',  $ind1)"/>
		<xsl:value-of select="util:single-element('Observation Result Information', $ind1)"/>
		<xsl:value-of select="util:element('Result Status', ..//OBR.25, $ind1)"/>
		<xsl:value-of select="util:element('Results Report/Status Change - Date/Time', util:format-time(..//OBR.22.1), $ind1)"/>
		<xsl:value-of select="util:element(' ', ' ',  $ind1)"/>
		
		
		<xsl:for-each select="..//OBR.28">
			<xsl:value-of select="util:single-element(concat('Results Copy To', util:blank-if-1-variant2(position(), count(..//OBR.28))), $ind1)"/>
			<xsl:value-of select="util:element('Name', concat(util:format-with-space(OBR.28.6), util:format-with-space(OBR.28.3), util:format-with-space(OBR.28.4), util:format-with-space(OBR.28.2.1), OBR.28.5), $ind1)"/>
			<xsl:value-of select="util:element('Identifier', OBR.28.1, $ind1)"/>
			<xsl:value-of select="util:element(' ', ' ',  $ind1)"/>
		</xsl:for-each>
		
		<xsl:value-of select="util:single-element('Results Handling', $ind1)"/>
		<xsl:value-of select="util:element('Standard', ..//OBR.49.9, $ind1)"/>
		<xsl:value-of select="util:element(' ', ' ',  $ind1)"/>
		<xsl:value-of select="util:single-element('Observation Notes', $ind1)"/>
		<xsl:for-each select="../NTE">
			<xsl:value-of select="util:element('Notes and comments', replace(.//NTE.3, '\\\\.br\\\\', $br), $ind1)"/>
		</xsl:for-each>
		<xsl:value-of select="util:single-element('', $ind1)"/>
		<xsl:value-of select="util:end-table($ind1)"/>
		<xsl:value-of select="util:begin-sub-table($ind1)"/>
		<xsl:value-of select="util:title-no-tab('title', 'Timing/Quantity Information', 'Timing/Quantity Information', $ind1, false())"/>
		<xsl:value-of select="util:elements($ind2)"/>
		<xsl:value-of select="util:element('Priority', ..//TQ1-9.2, $ind2)"/>
		<xsl:value-of select="util:element('Start Date/time ', ..//TQ1-7.1, $ind2)"/>
		<xsl:value-of select="util:element('End Date/time', ..//TQ1-8.1, $ind2)"/>
		<xsl:value-of select="util:end-table-fieldset($ind1)"/>
		<xsl:variable name="multiple-obx" select="count(..//OBX) &gt; 1"/>
		<xsl:for-each select="..//OBX">
			<xsl:variable name="index">
				<xsl:if test="$multiple-obx">
					<xsl:value-of select="concat(' - ', position())"/>
				</xsl:if>
			</xsl:variable>
			<xsl:value-of select="util:begin-sub-table($ind2)"/>
			<xsl:value-of select="util:title-no-tab('title', concat('Results Performing Laboratory', $index), concat('Results Performing Laboratory',  $index), $ind2, false())"/>
			<xsl:value-of select="util:elements($ind2)"/>
			<xsl:value-of select="util:element('Laboratory Name', .//OBX.23.1, $ind1)"/>
			<xsl:value-of select="util:element('Organization identifier', .//OBX.23.10, $ind1)"/>
			<xsl:value-of select="util:element('Address', util:format-address(.//OBX.24.1.1, .//OBX.24.2, concat(.//OBX.24.3, ' ', .//OBX.24.4), .//OBX.24.5, .//OBX.24.6), $ind1)"/>
			<xsl:value-of select="util:element('Director Name', concat(util:format-with-space(.//OBX.25.6), util:format-with-space(.//OBX.25.3), util:format-with-space(.//OBX.25.4), util:format-with-space(.//OBX.25.2.1), util:format-with-space(.//OBX.25.5)), $ind1)"/>
			<xsl:value-of select="util:element('Director identifier', .//OBX.25.1, $ind1)"/>
			<xsl:value-of select="util:end-table-fieldset($ind1)"/>
		</xsl:for-each>
		<xsl:variable name="multiple-specimens" select="count(..//SPM) &gt; 1"/>
		<xsl:for-each select="..//SPM">
			<xsl:variable name="index">
				<xsl:if test="$multiple-specimens">
					<xsl:value-of select="concat(' - ', position())"/>
				</xsl:if>
			</xsl:variable>
			<xsl:value-of select="util:begin-sub-table($ind2)"/>
			<xsl:value-of select="util:title-no-tab('title', concat('Specimen Information', $index), concat('Specimen Information', $index), $ind2, false())"/>
			<xsl:value-of select="util:elements($ind2)"/>
			<xsl:value-of select="util:element('Specimen Type', .//SPM.4.2, $ind1)"/>
			<xsl:value-of select="util:element('Alt Specimen Type', .//SPM.4.5, $ind1)"/>
			<xsl:value-of select="util:element('Specimen Original Text', .//SPM.4.9, $ind1)"/>
			<xsl:value-of select="util:element('Start date/time', .//SPM.17.1.1, $ind1)"/>
			<xsl:for-each select="..//SPM.21">
				<xsl:value-of select="util:element(concat('Specimen Reject Reason', util:blank-if-1-variant2(position(), count(..//SPM.21))), SPM.21.2, $ind1)"/>
				<xsl:value-of select="util:element(concat('Alt Specimen Reject Reason', util:blank-if-1-variant2(position(), count(..//SPM.21))), SPM.21.5, $ind1)"/>
				<xsl:value-of select="util:element(concat('Reject Reason Original Text', util:blank-if-1-variant2(position(), count(..//SPM.21))), SPM.21.9, $ind1)"/>
			</xsl:for-each>

			<xsl:for-each select="..//SPM.24">
				<xsl:value-of select="util:element(concat('Specimen Condition', util:blank-if-1-variant2(position(), count(..//SPM.24))), SPM.24.2, $ind1)"/>
				<xsl:value-of select="util:element(concat('Alt Specimen Condition', util:blank-if-1-variant2(position(), count(..//SPM.24))), SPM.24.5, $ind1)"/>
				<xsl:value-of select="util:element(concat('Condition Original Text', util:blank-if-1-variant2(position(), count(..//SPM.24))), SPM.24.9, $ind1)"/>
			</xsl:for-each>

			<xsl:value-of select="util:end-table-fieldset($ind1)"/>
		</xsl:for-each>
		
		
		<xsl:value-of select="util:begin-sub-table($ind2)"/>
		<xsl:value-of select="util:title-no-tab('title',  'Lab results', 'Lab results', $ind2, false())"/>
		<xsl:value-of select="util:elements-with-colspan(9, $ind2)"/>
		<xsl:value-of select="util:element-var-cols('Test performed', util:or5(..//OBR.4.9, ..//OBR-4.2, ..//OBR-4.5, '', ''), 9, $ind1)"/>
		<xsl:value-of select="util:element-var-cols('Test Report date', util:format-date(..//OBR.22.1), 9, $ind1)"/>

		<xsl:variable name="at-least-one-obx" select="count(..//OBX) &gt; 0"/>
		
		<xsl:if test="$at-least-one-obx">
		
		<xsl:value-of select="util:elements9-header('Result Observation Name',  'Result', 'UOM', 'Range', 'Abnormal Flag', 'Status', 'Date/Time of Observation', 'Date/Time of Analysis', 'Notes', $ind2)"/>
		
		<xsl:for-each select="..//OBX">
			<xsl:variable name="notes">
				<xsl:for-each select="..//NTE">
					<xsl:value-of select="concat(replace(current()/NTE.3, '\\.br\\', $br), $nl)"/>
				</xsl:for-each>
			</xsl:variable>
			<xsl:value-of select="util:elements9(util:or5(.//OBX.3.9, ..//OBX.3.2, ..//OBX.3.5, '', ''), util:obx-result(current()), util:or5(.//OBX.6.9, .//OBX.6.2, .//OBX.6.5, .//OBX.6.1, .//OBX.6.4), .//OBX.7, .//OBX.8, .//OBX.11, util:format-date(.//OBX.14.1), util:format-date(.//OBX.19.1), $notes, '', $ind2)"/>	
		</xsl:for-each>
		
		
		</xsl:if>

		<xsl:value-of select="util:end-table-fieldset($ind1)"/>
		
		
		<xsl:value-of select="util:end-tab($ind1, $vertical-orientation)"/>
	</xsl:template>
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!--  Observation Table: The title is from RXA -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<xsl:template match="OBX">
		<xsl:variable name="obX.value">
			<xsl:choose>
				<xsl:when test=".//OBX.2= 'CE'">
					<xsl:value-of select=".//OBX.5.2"/>
				</xsl:when>
				<xsl:when test=".//OBX.2 = 'TS' or .//OBX.2 = 'DT'">
					<xsl:value-of select="util:format-date(.//OBX.5.1)"/>
				</xsl:when>
			</xsl:choose>
		</xsl:variable>
		<xsl:value-of select="util:element(.//OBX.3.2, $obX.value, $ind2)"/>
	</xsl:template>
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  Iincludes - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:format-trailing">
		<xsl:param name="value"/>
		<xsl:param name="padding"/>
		<xsl:value-of select="$value"/>
		<xsl:if test="$value != ''">
			<xsl:value-of select="$padding"/>
		</xsl:if>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:format-with-space">
		<xsl:param name="value"/>
		<xsl:value-of select="util:format-trailing($value, ' ')"/>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:format-tel">
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
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:format-address">
		<xsl:param name="street"/>
		<xsl:param name="city"/>
		<xsl:param name="state"/>
		<xsl:param name="zip"/>
		<xsl:param name="country"/>
		<xsl:value-of select="concat(util:format-with-space($street), util:format-with-space($city), util:format-with-space($state), util:format-with-space($zip), util:format-with-space($country))"/>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:tags">
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
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:tag">
		<xsl:param name="tag"/>
		<xsl:param name="ind"/>
		<xsl:value-of select="concat($nl, $ind)"/>
		<xsl:text disable-output-escaping="yes">&lt;</xsl:text>
		<xsl:value-of select="$tag"/>
		<xsl:text disable-output-escaping="yes">&gt;</xsl:text>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:format-date">
		<xsl:param name="elementDataIn"/>
		<!-- pad it so that length problems don't happen -->
		<xsl:variable name="elementData" select="concat($elementDataIn, '                  ')"/>
		<xsl:if test="string-length(normalize-space($elementData)) &gt; 0">
			<xsl:variable name="year" select="substring($elementData,1,4)"/>
			<xsl:variable name="month" select="concat(substring($elementData,5,2),'/')"/>
			<xsl:variable name="day" select="concat(substring($elementData,7,2),'/')"/>
			<xsl:variable name="hour" select="concat(' ', substring($elementData,9,2), ':')"/>
			<xsl:variable name="min" select="concat(substring($elementData,11,2),' ')"/>
			<xsl:variable name="time">
				<xsl:if test="string-length(normalize-space($elementDataIn)) &gt; 11">
					<xsl:value-of select="concat($hour, $min)"/>
				</xsl:if>
			</xsl:variable>
			<xsl:value-of select="concat($month,$day,$year, $time)"/>
			<!-- <xsl:value-of select="format-date(xs:date(concat($month,$day,$year)),'[D1o] 
				[MNn], [Y]', 'en', (), ())"/> -->
		</xsl:if>
	</xsl:function><xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:format-time">
		<xsl:param name="time"/>
		<xsl:choose>
			<xsl:when test="string-length(normalize-space($time)) &lt; 9">
				<xsl:value-of select="util:format-date($time)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:variable name="year" select="substring($time,1,4)"/>
				<xsl:variable name="month" select="concat(substring($time,5,2),'/')"/>
				<xsl:variable name="day" select="concat(substring($time,7,2),'/')"/>
				<xsl:variable name="hrs" select="substring($time,9,2)"/>
				<xsl:variable name="cHrs">
					<xsl:choose>
						<xsl:when test="number($hrs) &gt; 12">
							<xsl:variable name="tHr" select="number($hrs) - 12"/>
							<xsl:choose>
								<xsl:when test="string-length(string($tHr)) = 1">
									<xsl:value-of select="concat('0',$tHr)"/>
								</xsl:when>
								<xsl:otherwise>
									<xsl:value-of select="$tHr"/>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:when>
						<xsl:when test="number($hrs) &lt; 12 or number($hrs) = 12">
							<xsl:value-of select="$hrs"/>
						</xsl:when>
					</xsl:choose>
				</xsl:variable>
				<xsl:variable name="mins" select="concat(':',substring($time,11,2))"/>
				<xsl:variable name="time-format" select="format-time(xs:time(concat($cHrs,$mins,':00')),'[H]:[m]')"/>
				<xsl:variable name="AM-PM">
					<xsl:choose>
						<xsl:when test="number($hrs) &gt; 12">
							<xsl:value-of select="'PM'"/>
						</xsl:when>
						<xsl:when test="number($hrs) &lt; 12">
							<xsl:value-of select="'AM'"/>
						</xsl:when>
					</xsl:choose>
				</xsl:variable>
				<xsl:value-of select="concat($month,$day,$year,' ',$time-format,' ',$AM-PM)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:start">
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
				<xsl:value-of select="util:tag('fieldset', '')"/>
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
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:begin-sub-table">
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($nl, $ind, '{&quot;element&quot; : &quot;obx&quot;, &quot;data&quot; : ', $nl)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:end-obx-group">
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
	</xsl:function>
	<xsl:variable xmlns:xalan="http://xml.apache.org/xslt" name="indent" select="'&#x9;'"/>
	<xsl:variable xmlns:xalan="http://xml.apache.org/xslt" name="nl" select="'&#xA;'"/>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:title">
		<xsl:param name="name"/>
		<xsl:param name="tabname"/>
		<xsl:param name="value"/>
		<xsl:param name="ind"/>
		<xsl:param name="endprevioustable" as="xs:boolean"/>
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:param name="full" as="xs:boolean"/>

		<xsl:value-of select="util:_title($name, $tabname, $value, '', $ind, $endprevioustable, $vertical-orientation, $full)"/>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:_title">
		<xsl:param name="name"/>
		<xsl:param name="tabname"/>
		<xsl:param name="value"/>
		<xsl:param name="additionalvalue"/>
		<xsl:param name="ind"/>
		<xsl:param name="endprevioustable" as="xs:boolean"/>
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:param name="full" as="xs:boolean"/>
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
				<xsl:if test="not($full)">
					<xsl:value-of select="util:_begin-tab($tabname, $value, $additionalvalue, '', $vertical-orientation)"/>
				</xsl:if>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($prelude, $ind, '{', $nl, $ind, $indent, '&quot;', $name, '&quot;', ':', '&quot;', $value, '&quot;,', $nl)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:title-no-tab">
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
				<xsl:value-of select="util:title($name, $tabname, $value, $ind, $endprevioustable, false(), true())"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:end-title-no-tab">
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="$output = 'ng-tab-html'">
				<xsl:value-of select="util:tag('/fieldset', $ind)"/>
			</xsl:when>
			<xsl:otherwise>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:begin-tab">
		<xsl:param name="tabname"/>
		<xsl:param name="val"/>
		<xsl:param name="ind"/>
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		
		<xsl:value-of select="util:_begin-tab($tabname, $val, '', $ind, $vertical-orientation)"/>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:_begin-tab">
		<xsl:param name="tabname"/>
		<xsl:param name="val"/>
		<xsl:param name="additionalval"/>
		<xsl:param name="ind"/>
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<!-- use the tabname to convert into a valid javascript variable name that is used to track open and close of the accordions -->
		<xsl:variable name="isOpenVar" select="concat('xsl', replace($tabname, '[ \\-]', ''))"/>
		<xsl:choose>
			<xsl:when test="$output = 'ng-tab-html'">
				<xsl:value-of select="util:tag(concat(util:IfThenElse($vertical-orientation,                   concat('accordion-group class=&quot;panel-info&quot; type=&quot;pills&quot; style=&quot;margin-top:0;border: 1px ridge  #C6DEFF;&quot; is-open=&quot;', $isOpenVar, '&quot; '), 'tab'),                   util:IfThenElse($vertical-orientation, '', concat(' heading=&quot;', $tabname, '&quot; heading2=&quot;', $additionalval, '&quot; ')), ' vertical=&quot;', $vertical-orientation, '&quot;'), '')"/>
				<xsl:if test="$vertical-orientation">
					<xsl:value-of select="util:tag('accordion-heading', '')"/>
					<xsl:value-of select="util:tag('span class=&quot;clearfix&quot;', '')"/>
					<xsl:value-of select="util:tag('span class=&quot;accordion-heading pull-left&quot;', '')"/>
					<xsl:value-of select="util:tag(concat('i class=&quot;pull-left fa&quot; ng-class=&quot;{''fa-caret-down'': ', $isOpenVar, ', ''fa-caret-right'': !', $isOpenVar, '}&quot;'), '')"/>
					<xsl:value-of select="util:tag('/i', '')"/>
					<xsl:value-of select="$tabname"/>
					<xsl:value-of select="util:tag('/span', '')"/>
					<xsl:value-of select="util:tag('/span', '')"/>
					<xsl:value-of select="util:tag('/accordion-heading', '')"/>
				</xsl:if>
				<xsl:value-of select="util:tag('div class=&quot;panel panel-info&quot;', $ind)"/>
				<xsl:value-of select="util:tag('div class=&quot;panel-body&quot;', $ind)"/>
				<xsl:value-of select="util:tag('fieldset', $ind)"/>
			</xsl:when>
			<xsl:when test="$output = 'plain-html'">
				<xsl:value-of select="util:tag('fieldset', $ind)"/>
				<xsl:value-of select="util:tags('legend', $val, $ind)"/>
			</xsl:when>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:end-tab">
		<xsl:param name="ind"/>
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:choose>
			<xsl:when test="$output = 'ng-tab-html'">
				<xsl:value-of select="util:tag('/fieldset', '')"/>
				<xsl:value-of select="util:tag('/div', '')"/>
				<xsl:value-of select="util:tag('/div', '')"/>
				<xsl:value-of select="util:tag(util:IfThenElse($vertical-orientation, '/accordion-group', '/tab'), '')"/>
			</xsl:when>
			<xsl:when test="$output = 'plain-html'">
				<xsl:value-of select="util:tag('/fieldset', '')"/>
			</xsl:when>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:elements">
		<xsl:param name="ind"/>
		<xsl:value-of select="util:elements-with-colspan(2, $ind)"/>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:elements-with-colspan">
		<xsl:param name="cols" as="xs:integer"/>
		<xsl:param name="ind"/>
		
		<xsl:variable name="col1span" select="floor($cols div 2)"/>
		<xsl:variable name="col2span" select="$cols - $col1span"/>
		
		<xsl:choose>
			<xsl:when test="$generate-plain-html">
				<xsl:value-of select="util:tag('table', $ind)"/>
				<xsl:value-of select="util:tag('tr', $ind)"/>
				<xsl:value-of select="util:tag(concat('th colspan=', $col1span), $ind)"/>
				<xsl:value-of select="'Element'"/>
				<xsl:value-of select="util:tag('/th', $ind)"/>
				<xsl:value-of select="util:tag(concat('th colspan=', $col2span), $ind)"/>
				<xsl:value-of select="'Data'"/>
				<xsl:value-of select="util:tag('/th', $ind)"/>
				<xsl:value-of select="util:tag('/tr', $ind)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($ind, $indent, '&quot;elements&quot; : ', $nl, $ind, $indent, '[')"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:title-and-elements">
		<xsl:param name="title"/>
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">
				<xsl:value-of select="util:tag('table', $ind)"/>
				<xsl:value-of select="util:tag('tr', $ind)"/>
				<xsl:value-of select="util:tag('th colspan=2 ', $ind)"/>
				<xsl:value-of select="$title"/>
				<xsl:value-of select="util:tag('/th ', $ind)"/>
				<xsl:value-of select="util:tag('/tr', $ind)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($ind, $indent, '&quot;elements&quot; : ', $nl, $ind, $indent, '[')"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:message-elements">
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
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:end-sub-table">
		<xsl:param name="ind"/>
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">
				<xsl:variable name="end-elements">
					<xsl:value-of select="util:tag('/table', $ind)"/>
					<xsl:value-of select="util:tag('br/', $ind)"/>
					<xsl:value-of select="util:tag('/fieldset', $ind)"/>
					<xsl:value-of select="util:end-tab($ind, $vertical-orientation)"/>
				</xsl:variable>
				<xsl:value-of select="$end-elements"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($nl, $indent, ']', $ind2, '}', $nl, $ind2, '}', $nl, $ind1, ']', $nl)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:end-elements">
		<xsl:param name="ind"/>
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:param name="full" as="xs:boolean"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">
				<xsl:variable name="end-elements">
					<xsl:value-of select="util:tag('/table', $ind)"/>
					<xsl:value-of select="util:tag('br/', $ind)"/>
					<xsl:if test="not($full)">
						<xsl:value-of select="util:end-tab($ind, $vertical-orientation)"/>
					</xsl:if>
				</xsl:variable>
				<xsl:value-of select="$end-elements"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($ind, ']', $nl)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:element">
		<xsl:param name="name"/>
		<xsl:param name="value"/>
		<xsl:param name="ind"/>
		<xsl:message> Processing <xsl:value-of select="$name"/></xsl:message>
		<xsl:value-of select="util:element-with-delimiter($name, $value, ',', 2, $ind)"/>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:element-var-cols">
		<xsl:param name="name"/>
		<xsl:param name="value"/>
		<xsl:param name="cols" as="xs:integer"/>
		<xsl:param name="ind"/>
		<xsl:message> Processing <xsl:value-of select="$name"/></xsl:message>
		<xsl:value-of select="util:element-with-delimiter($name, $value, ',', $cols, $ind)"/>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:last-element">
		<xsl:param name="name"/>
		<xsl:param name="value"/>
		<xsl:param name="ind"/>
		<xsl:param name="vertical-orientation" as="xs:boolean"/>
		<xsl:param name="full" as="xs:boolean"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">
				<xsl:value-of select="util:element-with-delimiter($name, $value, '', 2, $ind)"/>
				<xsl:if test="not($full)">
					<xsl:value-of select="util:tag('/table', $ind)"/>
				</xsl:if>
				<xsl:value-of select="util:end-tab($ind, $vertical-orientation)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat(util:element-with-delimiter($name, $value, '', 2, $ind), $nl, $ind, $indent, ']', $nl)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:end-table">
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">
				<xsl:value-of select="util:tag('/table', $ind)"/>
				<xsl:value-of select="util:tag('br/', $ind)"/>
			</xsl:when>
			<xsl:otherwise>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:end-table-fieldset">
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">
				<xsl:value-of select="util:tag('/table', $ind)"/>
				<xsl:value-of select="util:tag('br/', $ind)"/>
				<xsl:value-of select="util:tag('/fieldset', $ind)"/>
			</xsl:when>
			<xsl:otherwise>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:single-element">
		<xsl:param name="name"/>
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">
				<xsl:variable name="td-element">
					<xsl:value-of select="util:tag('td class=&quot;separator&quot; colspan=&quot;2&quot;', $ind)"/>
					<xsl:value-of select="$name"/>
					<xsl:value-of select="util:tag('/td',$ind)"/>
				</xsl:variable>
				<xsl:value-of select="util:tags('tr', $td-element, $ind)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="util:element-with-delimiter($name, '', ',', 2, $ind)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:element-with-delimiter">
		<xsl:param name="name"/>
		<xsl:param name="value"/>
		<xsl:param name="trailing"/>
		<xsl:param name="cols" as="xs:integer"/>
		<xsl:param name="ind"/>
		
		<xsl:variable name="col1span" select="floor($cols div 2)"/>
		<xsl:variable name="col2span" select="$cols - $col1span"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">
				<xsl:variable name="td-element">
					<xsl:value-of select="util:tag(concat('td colspan=', $col1span), $ind)"/>
					<xsl:value-of select="$name"/>
					<xsl:value-of select="util:tag('/td', $ind)"/>
					<xsl:message>
						<xsl:value-of select="$name"/> </xsl:message>
					<xsl:choose>
						<xsl:when test="normalize-space($value) = ''">
							<xsl:value-of select="util:tag(concat('td class=''noData'' colspan=', $col2span), $ind)"/>
							<xsl:value-of select="$value"/>
							<xsl:value-of select="util:tag('/td', $ind)"/>
						</xsl:when>
						<xsl:otherwise>
								<xsl:value-of select="util:tag(concat('td colspan=', $col2span), $ind)"/>
								<xsl:value-of select="$value"/>
								<xsl:value-of select="util:tag('/td', $ind)"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<xsl:value-of select="util:tags('tr', $td-element, $ind)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($nl, $ind, $indent, $indent, '{&quot;element&quot; : &quot;', $name, '&quot;, &quot;data&quot; : &quot;', $value, '&quot;}', $trailing)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:message-element-with-delimiter">
		<xsl:param name="location"/>
		<xsl:param name="dataelement"/>
		<xsl:param name="data"/>
		<xsl:param name="categorization"/>
		<xsl:param name="trailing"/>
		<xsl:param name="ind"/>
		<xsl:param name="item-hierarchy"/>
		<xsl:variable name="isField" as="xs:boolean" select="$item-hierarchy = 'Field'"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">
				<xsl:variable name="td-element">
					<xsl:value-of select="util:tag(concat('td class=&quot;', $item-hierarchy, '&quot;'), $ind)"/>
					<xsl:value-of select="concat(substring($location, 1, 3), '-', substring($location, 5, string-length($location) - 4))"/>
					<xsl:value-of select="util:tag('/td', $ind)"/>
					<xsl:value-of select="util:tag(concat('td class=&quot;', $item-hierarchy, '&quot;'), $ind)"/>
					<xsl:value-of select="$dataelement"/>
					<xsl:value-of select="util:tag('/td', $ind)"/>
					<xsl:value-of select="util:tag(concat('td class=&quot;', util:IfThenElse($isField, $item-hierarchy,  util:IfEmptyThenElse($data, 'noData', 'Data')), '&quot;'), $ind)"/>
					<xsl:value-of select="$data"/>
					<xsl:value-of select="util:tag('/td', $ind)"/>
					<xsl:value-of select="util:tag(concat('td class=&quot;', util:IfThenElse($isField, $item-hierarchy, util:IfEmptyThenElse($categorization, 'noData', 'Data')), '&quot;'), $ind)"/>
					<xsl:value-of select="$categorization"/>
					<xsl:value-of select="util:tag('/td', $ind)"/>
				</xsl:variable>
				<xsl:value-of select="util:tags('tr', $td-element, $ind)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($nl, $ind, $indent, $indent,         '{&quot;location&quot; : &quot;', $location, '&quot;, &quot;dataelement&quot; : &quot;', $dataelement, '&quot;, &quot;data&quot; : &quot;', $data, '&quot;, &quot;categorization&quot; : &quot;', $categorization, '&quot;}', $trailing)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:end">
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">
				<xsl:if test="$output = 'ng-tab-html'">
					<xsl:value-of select="util:tag('/tabset', '')"/>
				</xsl:if>
				<xsl:value-of select="util:tag('/div', $ind)"/>
				<xsl:value-of select="util:tag('/fieldset', '')"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($nl, $ind, '}', $nl, ']', $nl, '}')"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:blank-if-1">
		<xsl:param name="pos"/>
		<xsl:param name="total"/>
		<xsl:message>
			<xsl:value-of select="$total"/>
		</xsl:message>
		<xsl:choose>
			<xsl:when test="$total = 1">
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$pos"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:blank-if-1-variant2">
		<xsl:param name="pos"/>
		<xsl:param name="total"/>
		<xsl:choose>
			<xsl:when test="$pos = 1">
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat('[', $pos, ']')"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:action-code">
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
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:admin-sex">
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
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:protection-indicator">
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
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:IfEmptyThenElse">
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
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:IfThenElse">
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
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:valueset">
		<xsl:param name="key"/>
		<xsl:param name="tablename"/>
		<xsl:if test="count($HL7Tables/Tables/TableDefinition[@Id=$tablename]/t[@c=$key]) = 0">
			<xsl:message>Problem!  Tablename = 
				<xsl:value-of select="$tablename"/>
				Keyname = 
				<xsl:value-of select="$key"/>
			</xsl:message>
		</xsl:if>
		<xsl:value-of select="$HL7Tables/Tables/TableDefinition[@Id=$tablename]/t[@c=$key]/@d"/>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:valueset2">
		<xsl:param name="key"/>
		<xsl:param name="table"/>
		<xsl:value-of select="$table/t[@c=$key]/@d"/>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:union">
		<xsl:param name="table1"/>
		<xsl:param name="table2"/>
		<xsl:value-of select="$table1 | $table2"/>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:table">
		<xsl:param name="tablename"/>
		<xsl:value-of select="$HL7Tables/Tables/TableDefinition[@Id=$tablename]"/>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:value-or-valueset">
		<xsl:param name="val"/>
		<xsl:param name="key"/>
		<xsl:param name="tablename"/>
		<xsl:message> Valueset:  <xsl:value-of select="$key"/> </xsl:message>
		<xsl:choose>
			<xsl:when test="string-length(normalize-space($val)) = 0">
				<xsl:value-of select="util:valueset($key, $tablename)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$val"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:strip-tabsets">
		<xsl:param name="html"/>
		<xsl:variable name="pass1" select="replace($html, 'tab heading=&quot;([^&quot;]*)&quot; *heading2=&quot;([^&quot;]*)&quot; *vertical=&quot;false&quot;', 'fieldset&gt; &lt;legend&gt; $1 &lt;/legend')"/>
		<xsl:variable name="pass2" select="replace($pass1, '/tab&gt;', '/fieldset&gt;')"/>
		<xsl:variable name="pass3" select="replace($pass2, 'span class=&quot;accordion-heading pull-left&quot;', 'span')"/>
		<xsl:variable name="pass4" select="replace($pass3, 'i class=&quot;pull-left fa&quot; ng-', 'i ')"/>
		<xsl:variable name="pass5" select="replace($pass4, 'accordion-heading', 'legend')"/>
		<xsl:value-of select="replace(replace($pass5, '(&lt;tab heading=&quot;.*&quot;)|(&lt;tabset)|(&lt;accordion((-group)|(-heading))?)', '&lt;diV'),                     '(&lt;/tab&gt;)|(&lt;/tabset&gt;)|(&lt;/accordion((-group)|(-heading))?&gt;)', '&lt;/div&gt;')"/>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:strip-tabsets2">
		<xsl:param name="html"/>

		<xsl:variable name="isOpenVar" select="'xslfulltab$2'"/>
		<xsl:variable name="vertical-orientation" select="true()"/>
		<xsl:variable name="accordion-block">
			<xsl:value-of select="util:tag(concat(util:IfThenElse($vertical-orientation,                  concat('accordion-group class=&quot;panel-info&quot; type=&quot;pills&quot; style=&quot;margin-top:0;border: 1px ridge  #C6DEFF;&quot; is-open=&quot;', $isOpenVar, '&quot; '), 'tab'),                  util:IfThenElse($vertical-orientation, '', concat(' heading=&quot;', '$1', '&quot; ')), ' vertical=&quot;', $vertical-orientation, '&quot;'), '')"/>
			<xsl:value-of select="util:tag('accordion-heading', '')"/>
			<xsl:value-of select="util:tag('span class=&quot;clearfix&quot;', '')"/>
			<xsl:value-of select="util:tag('span class=&quot;accordion-heading pull-left&quot;', '')"/>
			<xsl:value-of select="util:tag(concat('i class=&quot;pull-left fa&quot; ng-class=&quot;{''fa-caret-down'': ', $isOpenVar, ', ''fa-caret-right'': !', $isOpenVar, '}&quot;'), '')"/>
			<xsl:value-of select="util:tag('/i', '')"/>
			<xsl:value-of select="'$2'"/>
			<xsl:value-of select="util:tag('/span', '')"/>
			<xsl:value-of select="util:tag('/span', '')"/>
			<xsl:value-of select="util:tag('/accordion-heading', '')"/>
		 </xsl:variable>
	 
		<xsl:variable name="pass1" select="replace($html, '&lt;tab heading=&quot;([^&quot;]*)&quot; *heading2=&quot;([^&quot;]*)&quot; *vertical=&quot;false&quot;&gt;', $accordion-block)"/>
		<xsl:variable name="pass2" select="replace($pass1, '/tab&gt;', '/accordion-group&gt;')"/>
		<xs:value-of select="$pass2"/>
		<xsl:value-of select="$pass2"/>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:segdesc">
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
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:completion-status">
		<xsl:param name="status"/>
		<xsl:choose>
			<xsl:when test="$status = 'CP'">
				<xsl:value-of select="'Complete'"/>
			</xsl:when>
			<xsl:when test="$status = 'NA'">
				<xsl:value-of select="'Not Administered'"/>
			</xsl:when>
			<xsl:when test="$status = 'PA'">
				<xsl:value-of select="'Partially Administered'"/>
			</xsl:when>
			<xsl:when test="$status = 'RE'">
				<xsl:value-of select="'Refused'"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$status"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:imm-reg-status">
		<xsl:param name="status"/>
		<xsl:choose>
			<xsl:when test="$status = 'A'">
				<xsl:value-of select="'Active'"/>
			</xsl:when>
			<xsl:when test="$status = 'I'">
				<xsl:value-of select="'Inactive'"/>
			</xsl:when>
			<xsl:when test="$status = 'L'">
				<xsl:value-of select="'Inactive-Lost to follow-up (cannot contact)'"/>
			</xsl:when>
			<xsl:when test="$status = 'M'">
				<xsl:value-of select="'Inactive-Lost to follow-up (cannot contact)'"/>
			</xsl:when>
			<xsl:when test="$status = 'P'">
				<xsl:value-of select="'Inactive-Permanently inactive (do not re-activate or add new entries to this record)'"/>
			</xsl:when>
			<xsl:when test="$status = 'U'">
				<xsl:value-of select="'Unknown'"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$status"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:sub-refusal-reason">
		<xsl:param name="status"/>
		<xsl:choose>
			<xsl:when test="$status = '00'">
				<xsl:value-of select="'Parental decision'"/>
			</xsl:when>
			<xsl:when test="$status = '01'">
				<xsl:value-of select="'Religious exemption'"/>
			</xsl:when>
			<xsl:when test="$status = '02'">
				<xsl:value-of select="'Other'"/>
			</xsl:when>
			<xsl:when test="$status = '03'">
				<xsl:value-of select="'Patient decision'"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$status"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:yes-no">
		<xsl:param name="val"/>
		<xsl:choose>
			<xsl:when test="$val = '1' or $val = 'y' or $val = 'Y'"> <xsl:value-of select="'Yes'"/> </xsl:when>
			<xsl:otherwise> <xsl:value-of select="'No'"/> </xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:or5">
		<xsl:param name="val1"/>
		<xsl:param name="val2"/>
		<xsl:param name="val3"/>
		<xsl:param name="val4"/>
		<xsl:param name="val5"/>
		<xsl:choose>
			<xsl:when test="normalize-space($val1) != ''"> <xsl:value-of select="$val1"/> </xsl:when>
			<xsl:when test="normalize-space($val2) != ''"> <xsl:value-of select="$val2"/> </xsl:when>
			<xsl:when test="normalize-space($val3) != ''"> <xsl:value-of select="$val3"/> </xsl:when>
			<xsl:when test="normalize-space($val4) != ''"> <xsl:value-of select="$val4"/> </xsl:when>
			<xsl:when test="normalize-space($val5) != ''"> <xsl:value-of select="$val5"/> </xsl:when>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:element1">
		<xsl:param name="val"/>
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="normalize-space($val) = ''">
				<xsl:value-of select="util:tag('td class=''noData''', $ind)"/>
				<xsl:value-of select="$val"/>
				<xsl:value-of select="util:tag('/td', $ind)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="util:tags('td', $val, $ind)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:elements9-header">
		<xsl:param name="val1"/>
		<xsl:param name="val2"/>
		<xsl:param name="val3"/>
		<xsl:param name="val4"/>
		<xsl:param name="val5"/>
		<xsl:param name="val6"/>
		<xsl:param name="val7"/>
		<xsl:param name="val8"/>
		<xsl:param name="val9"/>
		<xsl:param name="ind"/>
		
		<xsl:value-of select="util:elements9($val1, $val2, $val3, $val4, $val5, $val6, $val7, $val8, $val9, ' class=&quot;separator&quot; ', $ind)"/>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:elements9">
		<xsl:param name="val1"/>
		<xsl:param name="val2"/>
		<xsl:param name="val3"/>
		<xsl:param name="val4"/>
		<xsl:param name="val5"/>
		<xsl:param name="val6"/>
		<xsl:param name="val7"/>
		<xsl:param name="val8"/>
		<xsl:param name="val9"/>
		<xsl:param name="tdclass"/>
		<xsl:param name="ind"/>
		<xsl:choose>
			<xsl:when test="$generate-plain-html">
				<xsl:variable name="td-element">
					<xsl:value-of select="util:element1($val1, $ind1)"/>
					<xsl:value-of select="util:element1($val2, $ind1)"/>
					<xsl:value-of select="util:element1($val3, $ind1)"/>
					<xsl:value-of select="util:element1($val4, $ind1)"/>
					<xsl:value-of select="util:element1($val5, $ind1)"/>
					<xsl:value-of select="util:element1($val6, $ind1)"/>
					<xsl:value-of select="util:element1($val7, $ind1)"/>
					<xsl:value-of select="util:element1($val8, $ind1)"/>
					<xsl:value-of select="util:element1($val9, $ind1)"/>
				</xsl:variable>
				<xsl:value-of select="util:tag(concat('tr', $tdclass), $ind)"/>
				<xsl:value-of select="$td-element"/>
				<xsl:value-of select="util:tag('/tr', $ind)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="concat($nl, $ind, $indent, $indent, '{&quot;val1&quot; : &quot;', $val1, '&quot;, &quot;val2&quot; : &quot;', $val2, '&quot;}', '')"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:function xmlns:xalan="http://xml.apache.org/xslt" name="util:obx-result">
		<xsl:param name="obx"/>
		<xsl:choose>
			<xsl:when test="$obx//OBX.2 = 'SN'">
				<xsl:value-of select="concat(util:format-with-space($obx//OBX.5.1), util:format-with-space($obx//OBX.5.2), util:format-with-space($obx//OBX.5.3), $obx//OBX.5.4)"/>
			</xsl:when>
			<xsl:when test="$obx//OBX.2 = 'TS'">
				<xsl:value-of select="$obx//OBX.5.1"/>
			</xsl:when>
			<xsl:when test="$obx//OBX.2 = 'CWE'">
				<xsl:value-of select="util:or5($obx//OBX.5.9, $obx//OBX.5.2, $obx//OBX.5.5, '', '')"/>
			</xsl:when>
			<xsl:when test="$obx//OBX.2 = 'ED'">
				<xsl:value-of select="$obx//OBX.5.5"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$obx//OBX.5"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
	<xsl:template xmlns:fo="http://www.w3.org/1999/XSL/Format" name="plain-html">
			<xsl:variable name="full">
				<xsl:call-template name="_main"/>
			</xsl:variable>
			<html xmlns="">
				<head>
					<title/>
					<xsl:call-template name="css"/>
				</head>
				<body>
					<div class="test-data-specs-main">
						<xsl:value-of select="util:strip-tabsets($full)"/>
					</div>
				</body>
			</html>
	</xsl:template>
	<xsl:template xmlns:fo="http://www.w3.org/1999/XSL/Format" name="plain-html-message-content">
			<xsl:variable name="full">
				<xsl:call-template name="_main"/>
			</xsl:variable>
			<html xmlns="">
				<head>
					<title/>
					<xsl:call-template name="css"/>
				</head>
				<body>
					<div class="message-content">
						<xsl:value-of select="util:strip-tabsets($full)"/>
					</div>
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
	</xsl:template>
	<xsl:template xmlns:fo="http://www.w3.org/1999/XSL/Format" name="test-story">
		document.write('<div xmlns="" id="test-tabs-0">');
		document.write(' ............. Test .......... Story................... ');
		document.write('</div>');
	</xsl:template>
	<xsl:template xmlns:fo="http://www.w3.org/1999/XSL/Format" name="message-content">
		document.write('<div xmlns="" id="test-tabs-2">');
		document.write(' ............. Message .......... Content................... ');
		document.write('</div>');
	</xsl:template>
	<xsl:template xmlns:fo="http://www.w3.org/1999/XSL/Format" name="test-data-specs">
		
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
							tab += '</table>
					</fieldset>'; // end the bigger table
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
			.test-data-specs-main legend {text-align:center;font-size:110%; font-weight:bold;}					
			.test-data-specs-main .nav-tabs {font-weight:bold;}					
			.test-data-specs-main .tds_obxGrpSpl {background:#B8B8B8;}
			.test-data-specs-main maskByMediaType {display:table;}
			.test-data-specs-main table tbody tr th {font-size:95%}
			.test-data-specs-main table tbody tr td {font-size:100%;}
			.test-data-specs-main table tbody tr th {text-align:left;background:#C6DEFF}
			.test-data-specs-main table thead tr th {text-align:center;}
			.test-data-specs-main fieldset {text-align:center;}
			.test-data-specs-main table { width:98%;border: 1px groove;table-layout: fixed; margin:0 auto;border-collapse: collapse;}
			.test-data-specs-main table  tr { border: 3px groove; }
			.test-data-specs-main table  th { border: 2px groove;}
			.test-data-specs-main table  td { border: 2px groove; }
			.test-data-specs-main table thead {border: 1px groove;background:#446BEC;text-align:left;}
			.test-data-specs-main .separator {background:rgb(240, 240, 255); text-align:left;}
			.test-data-specs-main table tbody tr td {text-align:left}
			.test-data-specs-main .noData {background:#B8B8B8;}
			.test-data-specs-main .childField {background:#B8B8B8;}
			.test-data-specs-main .title {text-align:left;}
			.test-data-specs-main h3 {text-align:center;page-break-inside: avoid;}
			.test-data-specs-main h2 {text-align:center;}
			.test-data-specs-main h1 {text-align:center;}
			.test-data-specs-main .pgBrk {padding-top:15px;}
			.test-data-specs-main .er7Msg {width:100%;}
			.test-data-specs-main .embSpace {padding-left:15px;}			
			.test-data-specs-main .accordion-heading { font-weight:bold; font-size:90%;}										
			.test-data-specs-main .accordion-heading i.fa:after { content: "\00a0 "; }									
			.test-data-specs-main  panel { margin: 10px 5px 5px 5px; }
			}
			
			@media print {
			.test-data-specs-main legend {text-align:center;font-size:110%; font-weight:bold;}					
			.test-data-specs-main .nav-tabs {font-weight:bold;}					
			.test-data-specs-main .obxGrpSpl {background:#B8B8B8;}
			.test-data-specs-main maskByMediaType {display:table;}
			.test-data-specs-main table tbody tr th {font-size:90%}
			.test-data-specs-main table tbody tr td {font-size:90%;}
			.test-data-specs-main table tbody tr th {text-align:left;background:#C6DEFF}
			.test-data-specs-main table thead tr th {text-align:center;background:#4682B4}
			.test-data-specs-main fieldset {text-align:center;page-break-inside: avoid;}
			.test-data-specs-main table { width:98%;border: 1px groove;table-layout: fixed; margin:0 auto;page-break-inside: avoid;border-collapse: collapse;}
			.test-data-specs-main table[id=vendor-labResults] thead tr {font-size:80%}
			.test-data-specs-main table[id=vendor-labResults] tbody tr {font-size:75%}
			.test-data-specs-main table  tr { border: 3px groove; }
			.test-data-specs-main table  th { border: 2px groove;}
			.test-data-specs-main table  td { border: 2px groove; }
			.test-data-specs-main table thead {border: 1px groove;background:#446BEC;text-align:left;}
			.test-data-specs-main .separator {background:rgb(240, 240, 255); text-align:left;}
			.test-data-specs-main table tbody tr td {text-align:left;}
			.test-data-specs-main .noData {background:#B8B8B8;}
			.test-data-specs-main .childField {background:#B8B8B8;}
			.test-data-specs-main .tds_title {text-align:left;margin-bottom:1%}
			.test-data-specs-main h3 {text-align:center;}
			.test-data-specs-main h2 {text-align:center;}
			.test-data-specs-main h1 {text-align:center;}
			.test-data-specs-main .tds_pgBrk {page-break-after:always;}
			.test-data-specs-main #er7Message table {border:0px;width:80%}
			.test-data-specs-main #er7Message td {background:#B8B8B8;font-size:65%;margin-top:6.0pt;border:0px;text-wrap:preserve-breaks;white-space:pre;}
			.test-data-specs-main .er7Msg {width:100%;font-size:80%;}
			.test-data-specs-main .er7MsgNote{width:100%;font-style:italic;font-size:80%;}
			.test-data-specs-main .embSpace {padding-left:15px;}
			.test-data-specs-main .embSubSpace {padding-left:25px;}
			.test-data-specs-main .accordion-heading { font-weight:bold; font-size:90%; }										
			.test-data-specs-main .accordion-heading i.fa:after { content: "\00a0 "; }									
			.test-data-specs-main  panel { margin: 10px 5px 5px 5px; }
			}
		</style>
	</xsl:template>
	<xsl:variable xmlns:fo="http://www.w3.org/1999/XSL/Format" name="HL7Tables">
        <Tables xmlns="">
        
        <!-- =================================================================================================================== -->
        
            <TableDefinition Codesys="PHVS_PulseOximetryUnit_UCUM" Id="PHVS_PulseOximetryUnit_UCUM" Name="Pulse Oximetry Unit" Oid="2.16.840.1.114222.4.11.3590" Type="Local" Version="1">
                <t c="%" d="percent"/>
            </TableDefinition>
            
            
         <!-- =================================================================================================================== -->

            <TableDefinition Codesys="PHVS_TemperatureUnit_UCUM" Id="PHVS_TemperatureUnit_UCUM" Name="Temperature Unit" Oid="2.16.840.1.114222.4.11.919" Type="Local" Version="1">
                <t c="Cel" d="degree Celsius"/>
                <t c="[degF]" d="degree Fahrenheit"/>
            </TableDefinition>

         <!-- =================================================================================================================== -->

            <TableDefinition Codesys="PH_DiagnosisType_HL7_2x" Id="HL70052" Name="Diagnosis type (HL7)" Oid="2.16.840.1.113883.12.52" Type="HL7" Version="HL7 v2.5">
                <t c="A" d="Admitting"/>
                <t c="F" d="Final"/>
                <t c="W" d="Working"/>
            </TableDefinition>


         <!-- =================================================================================================================== -->

            <TableDefinition Codesys="PHVS_AgeUnit_SyndromicSurveillance" Id="PHVS_AgeUnit_SyndromicSurveillance" Name="Age Unit (Syndromic Surveillance)" Oid="2.16.840.1.114222.4.11.3402" Type="Local" Version="1">
                <t c="d" d="day"/>
                <t c="mo" d="month"/>
                <t c="UNK" d="unknown"/>
                <t c="wk" d="week"/>
                <t c="a" d="year"/>
            </TableDefinition>


         <!-- =================================================================================================================== -->

            <TableDefinition Codesys="PH_RaceAndEthnicity_CDC" Id="CDCREC" Name="Race &amp; Ethnicity - CDC" Oid="2.16.840.1.113883.6.238" Type="HL7" Version="1.1">
                <t c="1006-6" d="Abenaki"/>
                <t c="1579-2" d="Absentee Shawnee"/>
                <t c="1490-2" d="Acoma"/>
                <t c="2126-1" d="Afghanistani"/>
                <t c="2060-2" d="African"/>
                <t c="2058-6" d="African American"/>
                <t c="1994-3" d="Agdaagux"/>
                <t c="1212-0" d="Agua Caliente"/>
                <t c="1045-4" d="Agua Caliente Cahuilla"/>
                <t c="1740-0" d="Ahtna"/>
                <t c="1654-3" d="Ak-Chin"/>
                <t c="1993-5" d="Akhiok"/>
                <t c="1897-8" d="Akiachak"/>
                <t c="1898-6" d="Akiak"/>
                <t c="2007-3" d="Akutan"/>
                <t c="1187-4" d="Alabama Coushatta"/>
                <t c="1194-0" d="Alabama Creek"/>
                <t c="1195-7" d="Alabama Quassarte"/>
                <t c="1899-4" d="Alakanuk"/>
                <t c="1383-9" d="Alamo Navajo"/>
                <t c="1744-2" d="Alanvik"/>
                <t c="1737-6" d="Alaska Indian"/>
                <t c="1735-0" d="Alaska Native"/>
                <t c="1739-2" d="Alaskan Athabascan"/>
                <t c="1741-8" d="Alatna"/>
                <t c="1900-0" d="Aleknagik"/>
                <t c="1966-1" d="Aleut"/>
                <t c="2008-1" d="Aleut Corporation"/>
                <t c="2009-9" d="Aleutian"/>
                <t c="2010-7" d="Aleutian Islander"/>
                <t c="1742-6" d="Alexander"/>
                <t c="1008-2" d="Algonquian"/>
                <t c="1743-4" d="Allakaket"/>
                <t c="1671-7" d="Allen Canyon"/>
                <t c="1688-1" d="Alpine"/>
                <t c="1392-0" d="Alsea"/>
                <t c="1968-7" d="Alutiiq Aleut"/>
                <t c="1845-7" d="Ambler"/>
                <t c="1004-1" d="American Indian"/>
                <t c="1002-5" d="American Indian or Alaska Native"/>
                <t c="1846-5" d="Anaktuvuk"/>
                <t c="1847-3" d="Anaktuvuk Pass"/>
                <t c="2138-6" d="Andalusian"/>
                <t c="1901-8" d="Andreafsky"/>
                <t c="1814-3" d="Angoon"/>
                <t c="1902-6" d="Aniak"/>
                <t c="1745-9" d="Anvik"/>
                <t c="1010-8" d="Apache"/>
                <t c="2129-5" d="Arab"/>
                <t c="1021-5" d="Arapaho"/>
                <t c="1746-7" d="Arctic"/>
                <t c="1849-9" d="Arctic Slope Corporation"/>
                <t c="1848-1" d="Arctic Slope Inupiat"/>
                <t c="2166-7" d="Argentinean"/>
                <t c="1026-4" d="Arikara"/>
                <t c="1491-0" d="Arizona Tewa"/>
                <t c="2109-7" d="Armenian"/>
                <t c="1366-4" d="Aroostook"/>
                <t c="2028-9" d="Asian"/>
                <t c="2029-7" d="Asian Indian"/>
                <t c="1028-0" d="Assiniboine"/>
                <t c="1030-6" d="Assiniboine Sioux"/>
                <t c="2119-6" d="Assyrian"/>
                <t c="2139-4" d="Asturian"/>
                <t c="2011-5" d="Atka"/>
                <t c="1903-4" d="Atmautluak"/>
                <t c="1850-7" d="Atqasuk"/>
                <t c="1265-8" d="Atsina"/>
                <t c="1234-4" d="Attacapa"/>
                <t c="1046-2" d="Augustine"/>
                <t c="1124-7" d="Bad River"/>
                <t c="2067-7" d="Bahamian"/>
                <t c="2030-5" d="Bangladeshi"/>
                <t c="1033-0" d="Bannock"/>
                <t c="2068-5" d="Barbadian"/>
                <t c="1712-9" d="Barrio Libre"/>
                <t c="1851-5" d="Barrow"/>
                <t c="1587-5" d="Battle Mountain"/>
                <t c="1125-4" d="Bay Mills Chippewa"/>
                <t c="1747-5" d="Beaver"/>
                <t c="2142-8" d="Belearic Islander"/>
                <t c="2012-3" d="Belkofski"/>
                <t c="1852-3" d="Bering Straits Inupiat"/>
                <t c="1904-2" d="Bethel"/>
                <t c="2031-3" d="Bhutanese"/>
                <t c="1567-7" d="Big Cypress"/>
                <t c="1905-9" d="Bill Moore's Slough"/>
                <t c="1235-1" d="Biloxi"/>
                <t c="1748-3" d="Birch Creek"/>
                <t c="1417-5" d="Bishop"/>
                <t c="2056-0" d="Black"/>
                <t c="2054-5" d="Black or African American"/>
                <t c="1035-5" d="Blackfeet"/>
                <t c="1610-5" d="Blackfoot Sioux"/>
                <t c="1126-2" d="Bois Forte"/>
                <t c="2167-5" d="Bolivian"/>
                <t c="2061-0" d="Botswanan"/>
                <t c="1853-1" d="Brevig Mission"/>
                <t c="1418-3" d="Bridgeport"/>
                <t c="1568-5" d="Brighton"/>
                <t c="1972-9" d="Bristol Bay Aleut"/>
                <t c="1906-7" d="Bristol Bay Yupik"/>
                <t c="1037-1" d="Brotherton"/>
                <t c="1611-3" d="Brule Sioux"/>
                <t c="1854-9" d="Buckland"/>
                <t c="2032-1" d="Burmese"/>
                <t c="1419-1" d="Burns Paiute"/>
                <t c="1039-7" d="Burt Lake Band"/>
                <t c="1127-0" d="Burt Lake Chippewa"/>
                <t c="1412-6" d="Burt Lake Ottawa"/>
                <t c="1047-0" d="Cabazon"/>
                <t c="1041-3" d="Caddo"/>
                <t c="1054-6" d="Cahto"/>
                <t c="1044-7" d="Cahuilla"/>
                <t c="1053-8" d="California Tribes"/>
                <t c="1907-5" d="Calista Yupik"/>
                <t c="2033-9" d="Cambodian"/>
                <t c="1223-7" d="Campo"/>
                <t c="1068-6" d="Canadian and Latin American Indian"/>
                <t c="1069-4" d="Canadian Indian"/>
                <t c="2163-4" d="Canal Zone"/>
                <t c="2145-1" d="Canarian"/>
                <t c="1384-7" d="Canoncito Navajo"/>
                <t c="1749-1" d="Cantwell"/>
                <t c="1224-5" d="Capitan Grande"/>
                <t c="2092-5" d="Carolinian"/>
                <t c="1689-9" d="Carson"/>
                <t c="2140-2" d="Castillian"/>
                <t c="2141-0" d="Catalonian"/>
                <t c="1076-9" d="Catawba"/>
                <t c="1286-4" d="Cayuga"/>
                <t c="1078-5" d="Cayuse"/>
                <t c="1420-9" d="Cedarville"/>
                <t c="1393-8" d="Celilo"/>
                <t c="2155-0" d="Central American"/>
                <t c="1070-2" d="Central American Indian"/>
                <t c="2162-6" d="Central American Indian"/>
                <t c="1815-0" d="Central Council of Tlingit and Haida Tribes"/>
                <t c="1465-4" d="Central Pomo"/>
                <t c="1750-9" d="Chalkyitsik"/>
                <t c="2088-3" d="Chamorro"/>
                <t c="1908-3" d="Chefornak"/>
                <t c="1080-1" d="Chehalis"/>
                <t c="1082-7" d="Chemakuan"/>
                <t c="1086-8" d="Chemehuevi"/>
                <t c="1985-1" d="Chenega"/>
                <t c="1088-4" d="Cherokee"/>
                <t c="1089-2" d="Cherokee Alabama"/>
                <t c="1100-7" d="Cherokee Shawnee"/>
                <t c="1090-0" d="Cherokees of Northeast Alabama"/>
                <t c="1091-8" d="Cherokees of Southeast Alabama"/>
                <t c="1909-1" d="Chevak"/>
                <t c="1102-3" d="Cheyenne"/>
                <t c="1612-1" d="Cheyenne River Sioux"/>
                <t c="1106-4" d="Cheyenne-Arapaho"/>
                <t c="2151-9" d="Chicano"/>
                <t c="1108-0" d="Chickahominy"/>
                <t c="1751-7" d="Chickaloon"/>
                <t c="1112-2" d="Chickasaw"/>
                <t c="1973-7" d="Chignik"/>
                <t c="2013-1" d="Chignik Lagoon"/>
                <t c="1974-5" d="Chignik Lake"/>
                <t c="2168-3" d="Chilean"/>
                <t c="1816-8" d="Chilkat"/>
                <t c="1817-6" d="Chilkoot"/>
                <t c="1055-3" d="Chimariko"/>
                <t c="2034-7" d="Chinese"/>
                <t c="1855-6" d="Chinik"/>
                <t c="1114-8" d="Chinook"/>
                <t c="1123-9" d="Chippewa"/>
                <t c="1150-2" d="Chippewa Cree"/>
                <t c="1011-6" d="Chiricahua"/>
                <t c="1752-5" d="Chistochina"/>
                <t c="1153-6" d="Chitimacha"/>
                <t c="1753-3" d="Chitina"/>
                <t c="1155-1" d="Choctaw"/>
                <t c="1910-9" d="Chuathbaluk"/>
                <t c="1984-4" d="Chugach Aleut"/>
                <t c="1986-9" d="Chugach Corporation"/>
                <t c="1718-6" d="Chukchansi"/>
                <t c="1162-7" d="Chumash"/>
                <t c="2097-4" d="Chuukese"/>
                <t c="1754-1" d="Circle"/>
                <t c="1479-5" d="Citizen Band Potawatomi"/>
                <t c="1911-7" d="Clark's Point"/>
                <t c="1115-5" d="Clatsop"/>
                <t c="1165-0" d="Clear Lake"/>
                <t c="1156-9" d="Clifton Choctaw"/>
                <t c="1056-1" d="Coast Miwok"/>
                <t c="1733-5" d="Coast Yurok"/>
                <t c="1492-8" d="Cochiti"/>
                <t c="1725-1" d="Cocopah"/>
                <t c="1167-6" d="Coeur D'Alene"/>
                <t c="1169-2" d="Coharie"/>
                <t c="2169-1" d="Colombian"/>
                <t c="1171-8" d="Colorado River"/>
                <t c="1394-6" d="Columbia"/>
                <t c="1116-3" d="Columbia River Chinook"/>
                <t c="1173-4" d="Colville"/>
                <t c="1175-9" d="Comanche"/>
                <t c="1755-8" d="Cook Inlet"/>
                <t c="1180-9" d="Coos"/>
                <t c="1178-3" d="Coos, Lower Umpqua, Siuslaw"/>
                <t c="1756-6" d="Copper Center"/>
                <t c="1757-4" d="Copper River"/>
                <t c="1182-5" d="Coquilles"/>
                <t c="2156-8" d="Costa Rican"/>
                <t c="1184-1" d="Costanoan"/>
                <t c="1856-4" d="Council"/>
                <t c="1186-6" d="Coushatta"/>
                <t c="1668-3" d="Cow Creek Umpqua"/>
                <t c="1189-0" d="Cowlitz"/>
                <t c="1818-4" d="Craig"/>
                <t c="1191-6" d="Cree"/>
                <t c="1193-2" d="Creek"/>
                <t c="2176-6" d="Criollo"/>
                <t c="1207-0" d="Croatan"/>
                <t c="1912-5" d="Crooked Creek"/>
                <t c="1209-6" d="Crow"/>
                <t c="1613-9" d="Crow Creek Sioux"/>
                <t c="2182-4" d="Cuban"/>
                <t c="1211-2" d="Cupeno"/>
                <t c="1225-2" d="Cuyapaipe"/>
                <t c="1614-7" d="Dakota Sioux"/>
                <t c="1857-2" d="Deering"/>
                <t c="1214-6" d="Delaware"/>
                <t c="1222-9" d="Diegueno"/>
                <t c="1057-9" d="Digger"/>
                <t c="1913-3" d="Dillingham"/>
                <t c="2070-1" d="Dominica Islander"/>
                <t c="2069-3" d="Dominican"/>
                <t c="2184-0" d="Dominican"/>
                <t c="1758-2" d="Dot Lake"/>
                <t c="1819-2" d="Douglas"/>
                <t c="1759-0" d="Doyon"/>
                <t c="1690-7" d="Dresslerville"/>
                <t c="1466-2" d="Dry Creek"/>
                <t c="1603-0" d="Duck Valley"/>
                <t c="1588-3" d="Duckwater"/>
                <t c="1519-8" d="Duwamish"/>
                <t c="1760-8" d="Eagle"/>
                <t c="1092-6" d="Eastern Cherokee"/>
                <t c="1109-8" d="Eastern Chickahominy"/>
                <t c="1196-5" d="Eastern Creek"/>
                <t c="1215-3" d="Eastern Delaware"/>
                <t c="1197-3" d="Eastern Muscogee"/>
                <t c="1467-0" d="Eastern Pomo"/>
                <t c="1580-0" d="Eastern Shawnee"/>
                <t c="1233-6" d="Eastern Tribes"/>
                <t c="1093-4" d="Echota Cherokee"/>
                <t c="2170-9" d="Ecuadorian"/>
                <t c="1914-1" d="Eek"/>
                <t c="1975-2" d="Egegik"/>
                <t c="2120-4" d="Egyptian"/>
                <t c="1761-6" d="Eklutna"/>
                <t c="1915-8" d="Ekuk"/>
                <t c="1916-6" d="Ekwok"/>
                <t c="1858-0" d="Elim"/>
                <t c="1589-1" d="Elko"/>
                <t c="1590-9" d="Ely"/>
                <t c="1917-4" d="Emmonak"/>
                <t c="2110-5" d="English"/>
                <t c="1987-7" d="English Bay"/>
                <t c="1840-8" d="Eskimo"/>
                <t c="1250-0" d="Esselen"/>
                <t c="2062-8" d="Ethiopian"/>
                <t c="2133-7" d="Ethnicity"/>
                <t c="1094-2" d="Etowah Cherokee"/>
                <t c="2108-9" d="European"/>
                <t c="1762-4" d="Evansville"/>
                <t c="1990-1" d="Eyak"/>
                <t c="1604-8" d="Fallon"/>
                <t c="2015-6" d="False Pass"/>
                <t c="2101-4" d="Fijian"/>
                <t c="2036-2" d="Filipino"/>
                <t c="1615-4" d="Flandreau Santee"/>
                <t c="1569-3" d="Florida Seminole"/>
                <t c="1128-8" d="Fond du Lac"/>
                <t c="1480-3" d="Forest County"/>
                <t c="1252-6" d="Fort Belknap"/>
                <t c="1254-2" d="Fort Berthold"/>
                <t c="1421-7" d="Fort Bidwell"/>
                <t c="1258-3" d="Fort Hall"/>
                <t c="1422-5" d="Fort Independence"/>
                <t c="1605-5" d="Fort McDermitt"/>
                <t c="1256-7" d="Fort Mcdowell"/>
                <t c="1616-2" d="Fort Peck"/>
                <t c="1031-4" d="Fort Peck Assiniboine Sioux"/>
                <t c="1012-4" d="Fort Sill Apache"/>
                <t c="1763-2" d="Fort Yukon"/>
                <t c="2111-3" d="French"/>
                <t c="1071-0" d="French American Indian"/>
                <t c="1260-9" d="Gabrieleno"/>
                <t c="1764-0" d="Gakona"/>
                <t c="1765-7" d="Galena"/>
                <t c="2143-6" d="Gallego"/>
                <t c="1892-9" d="Gambell"/>
                <t c="1680-8" d="Gay Head Wampanoag"/>
                <t c="1236-9" d="Georgetown (Eastern Tribes)"/>
                <t c="1962-0" d="Georgetown (Yupik-Eskimo)"/>
                <t c="2112-1" d="German"/>
                <t c="1655-0" d="Gila Bend"/>
                <t c="1457-1" d="Gila River Pima-Maricopa"/>
                <t c="1859-8" d="Golovin"/>
                <t c="1918-2" d="Goodnews Bay"/>
                <t c="1591-7" d="Goshute"/>
                <t c="1129-6" d="Grand Portage"/>
                <t c="1262-5" d="Grand Ronde"/>
                <t c="1130-4" d="Grand Traverse Band of Ottawa/Chippewa"/>
                <t c="1766-5" d="Grayling"/>
                <t c="1842-4" d="Greenland Eskimo"/>
                <t c="1264-1" d="Gros Ventres"/>
                <t c="2087-5" d="Guamanian"/>
                <t c="2086-7" d="Guamanian or Chamorro"/>
                <t c="2157-6" d="Guatemalan"/>
                <t c="1767-3" d="Gulkana"/>
                <t c="1820-0" d="Haida"/>
                <t c="2071-9" d="Haitian"/>
                <t c="1267-4" d="Haliwa"/>
                <t c="1481-1" d="Hannahville"/>
                <t c="1726-9" d="Havasupai"/>
                <t c="1768-1" d="Healy Lake"/>
                <t c="1269-0" d="Hidatsa"/>
                <t c="2135-2" d="Hispanic or Latino"/>
                <t c="2037-0" d="Hmong"/>
                <t c="1697-2" d="Ho-chunk"/>
                <t c="1083-5" d="Hoh"/>
                <t c="1570-1" d="Hollywood Seminole"/>
                <t c="1769-9" d="Holy Cross"/>
                <t c="2158-4" d="Honduran"/>
                <t c="1821-8" d="Hoonah"/>
                <t c="1271-6" d="Hoopa"/>
                <t c="1275-7" d="Hoopa Extension"/>
                <t c="1919-0" d="Hooper Bay"/>
                <t c="1493-6" d="Hopi"/>
                <t c="1277-3" d="Houma"/>
                <t c="1727-7" d="Hualapai"/>
                <t c="1770-7" d="Hughes"/>
                <t c="1482-9" d="Huron Potawatomi"/>
                <t c="1771-5" d="Huslia"/>
                <t c="1822-6" d="Hydaburg"/>
                <t c="1976-0" d="Igiugig"/>
                <t c="1772-3" d="Iliamna"/>
                <t c="1359-9" d="Illinois Miami"/>
                <t c="1279-9" d="Inaja-Cosmit"/>
                <t c="1860-6" d="Inalik Diomede"/>
                <t c="1442-3" d="Indian Township"/>
                <t c="1360-7" d="Indiana Miami"/>
                <t c="2038-8" d="Indonesian"/>
                <t c="1861-4" d="Inupiaq"/>
                <t c="1844-0" d="Inupiat Eskimo"/>
                <t c="1281-5" d="Iowa"/>
                <t c="1282-3" d="Iowa of Kansas-Nebraska"/>
                <t c="1283-1" d="Iowa of Oklahoma"/>
                <t c="1552-9" d="Iowa Sac and Fox"/>
                <t c="1920-8" d="Iqurmuit (Russian Mission)"/>
                <t c="2121-2" d="Iranian"/>
                <t c="2122-0" d="Iraqi"/>
                <t c="2113-9" d="Irish"/>
                <t c="1285-6" d="Iroquois"/>
                <t c="1494-4" d="Isleta"/>
                <t c="2127-9" d="Israeili"/>
                <t c="2114-7" d="Italian"/>
                <t c="1977-8" d="Ivanof Bay"/>
                <t c="2048-7" d="Iwo Jiman"/>
                <t c="2072-7" d="Jamaican"/>
                <t c="1313-6" d="Jamestown"/>
                <t c="2039-6" d="Japanese"/>
                <t c="1495-1" d="Jemez"/>
                <t c="1157-7" d="Jena Choctaw"/>
                <t c="1013-2" d="Jicarilla Apache"/>
                <t c="1297-1" d="Juaneno"/>
                <t c="1423-3" d="Kaibab"/>
                <t c="1823-4" d="Kake"/>
                <t c="1862-2" d="Kaktovik"/>
                <t c="1395-3" d="Kalapuya"/>
                <t c="1299-7" d="Kalispel"/>
                <t c="1921-6" d="Kalskag"/>
                <t c="1773-1" d="Kaltag"/>
                <t c="1995-0" d="Karluk"/>
                <t c="1301-1" d="Karuk"/>
                <t c="1824-2" d="Kasaan"/>
                <t c="1468-8" d="Kashia"/>
                <t c="1922-4" d="Kasigluk"/>
                <t c="1117-1" d="Kathlamet"/>
                <t c="1303-7" d="Kaw"/>
                <t c="1058-7" d="Kawaiisu"/>
                <t c="1863-0" d="Kawerak"/>
                <t c="1825-9" d="Kenaitze"/>
                <t c="1496-9" d="Keres"/>
                <t c="1059-5" d="Kern River"/>
                <t c="1826-7" d="Ketchikan"/>
                <t c="1131-2" d="Keweenaw"/>
                <t c="1198-1" d="Kialegee"/>
                <t c="1864-8" d="Kiana"/>
                <t c="1305-2" d="Kickapoo"/>
                <t c="1520-6" d="Kikiallus"/>
                <t c="2014-9" d="King Cove"/>
                <t c="1978-6" d="King Salmon"/>
                <t c="1309-4" d="Kiowa"/>
                <t c="1923-2" d="Kipnuk"/>
                <t c="2096-6" d="Kiribati"/>
                <t c="1865-5" d="Kivalina"/>
                <t c="1312-8" d="Klallam"/>
                <t c="1317-7" d="Klamath"/>
                <t c="1827-5" d="Klawock"/>
                <t c="1774-9" d="Kluti Kaah"/>
                <t c="1775-6" d="Knik"/>
                <t c="1866-3" d="Kobuk"/>
                <t c="1996-8" d="Kodiak"/>
                <t c="1979-4" d="Kokhanok"/>
                <t c="1924-0" d="Koliganek"/>
                <t c="1925-7" d="Kongiganak"/>
                <t c="1992-7" d="Koniag Aleut"/>
                <t c="1319-3" d="Konkow"/>
                <t c="1321-9" d="Kootenai"/>
                <t c="2040-4" d="Korean"/>
                <t c="2093-3" d="Kosraean"/>
                <t c="1926-5" d="Kotlik"/>
                <t c="1867-1" d="Kotzebue"/>
                <t c="1868-9" d="Koyuk"/>
                <t c="1776-4" d="Koyukuk"/>
                <t c="1927-3" d="Kwethluk"/>
                <t c="1928-1" d="Kwigillingok"/>
                <t c="1869-7" d="Kwiguk"/>
                <t c="1332-6" d="La Jolla"/>
                <t c="1226-0" d="La Posta"/>
                <t c="2152-7" d="La Raza"/>
                <t c="1132-0" d="Lac Courte Oreilles"/>
                <t c="1133-8" d="Lac du Flambeau"/>
                <t c="1134-6" d="Lac Vieux Desert Chippewa"/>
                <t c="1497-7" d="Laguna"/>
                <t c="1777-2" d="Lake Minchumina"/>
                <t c="1135-3" d="Lake Superior"/>
                <t c="1617-0" d="Lake Traverse Sioux"/>
                <t c="2041-2" d="Laotian"/>
                <t c="1997-6" d="Larsen Bay"/>
                <t c="1424-1" d="Las Vegas"/>
                <t c="1323-5" d="Lassik"/>
                <t c="2178-2" d="Latin American"/>
                <t c="2123-8" d="Lebanese"/>
                <t c="1136-1" d="Leech Lake"/>
                <t c="1216-1" d="Lenni-Lenape"/>
                <t c="1929-9" d="Levelock"/>
                <t c="2063-6" d="Liberian"/>
                <t c="1778-0" d="Lime"/>
                <t c="1014-0" d="Lipan Apache"/>
                <t c="1137-9" d="Little Shell Chippewa"/>
                <t c="1425-8" d="Lone Pine"/>
                <t c="1325-0" d="Long Island"/>
                <t c="1048-8" d="Los Coyotes"/>
                <t c="1426-6" d="Lovelock"/>
                <t c="1618-8" d="Lower Brule Sioux"/>
                <t c="1314-4" d="Lower Elwha"/>
                <t c="1930-7" d="Lower Kalskag"/>
                <t c="1199-9" d="Lower Muscogee"/>
                <t c="1619-6" d="Lower Sioux"/>
                <t c="1521-4" d="Lower Skagit"/>
                <t c="1331-8" d="Luiseno"/>
                <t c="1340-9" d="Lumbee"/>
                <t c="1342-5" d="Lummi"/>
                <t c="1200-5" d="Machis Lower Creek Indian"/>
                <t c="2052-9" d="Madagascar"/>
                <t c="1344-1" d="Maidu"/>
                <t c="1348-2" d="Makah"/>
                <t c="2042-0" d="Malaysian"/>
                <t c="2049-5" d="Maldivian"/>
                <t c="1427-4" d="Malheur Paiute"/>
                <t c="1350-8" d="Maliseet"/>
                <t c="1352-4" d="Mandan"/>
                <t c="1780-6" d="Manley Hot Springs"/>
                <t c="1931-5" d="Manokotak"/>
                <t c="1227-8" d="Manzanita"/>
                <t c="2089-1" d="Mariana Islander"/>
                <t c="1728-5" d="Maricopa"/>
                <t c="1932-3" d="Marshall"/>
                <t c="2090-9" d="Marshallese"/>
                <t c="1454-8" d="Marshantucket Pequot"/>
                <t c="1889-5" d="Mary's Igloo"/>
                <t c="1681-6" d="Mashpee Wampanoag"/>
                <t c="1326-8" d="Matinecock"/>
                <t c="1354-0" d="Mattaponi"/>
                <t c="1060-3" d="Mattole"/>
                <t c="1870-5" d="Mauneluk Inupiat"/>
                <t c="1779-8" d="Mcgrath"/>
                <t c="1620-4" d="Mdewakanton Sioux"/>
                <t c="1933-1" d="Mekoryuk"/>
                <t c="2100-6" d="Melanesian"/>
                <t c="1356-5" d="Menominee"/>
                <t c="1781-4" d="Mentasta Lake"/>
                <t c="1228-6" d="Mesa Grande"/>
                <t c="1015-7" d="Mescalero Apache"/>
                <t c="1838-2" d="Metlakatla"/>
                <t c="2148-5" d="Mexican"/>
                <t c="2149-3" d="Mexican American"/>
                <t c="1072-8" d="Mexican American Indian"/>
                <t c="2153-5" d="Mexican American Indian"/>
                <t c="2150-1" d="Mexicano"/>
                <t c="1358-1" d="Miami"/>
                <t c="1363-1" d="Miccosukee"/>
                <t c="1413-4" d="Michigan Ottawa"/>
                <t c="1365-6" d="Micmac"/>
                <t c="2085-9" d="Micronesian"/>
                <t c="2118-8" d="Middle Eastern or North African"/>
                <t c="1138-7" d="Mille Lacs"/>
                <t c="1621-2" d="Miniconjou"/>
                <t c="1139-5" d="Minnesota Chippewa"/>
                <t c="1782-2" d="Minto"/>
                <t c="1368-0" d="Mission Indians"/>
                <t c="1158-5" d="Mississippi Choctaw"/>
                <t c="1553-7" d="Missouri Sac and Fox"/>
                <t c="1370-6" d="Miwok"/>
                <t c="1428-2" d="Moapa"/>
                <t c="1372-2" d="Modoc"/>
                <t c="1729-3" d="Mohave"/>
                <t c="1287-2" d="Mohawk"/>
                <t c="1374-8" d="Mohegan"/>
                <t c="1396-1" d="Molala"/>
                <t c="1376-3" d="Mono"/>
                <t c="1327-6" d="Montauk"/>
                <t c="1237-7" d="Moor"/>
                <t c="1049-6" d="Morongo"/>
                <t c="1345-8" d="Mountain Maidu"/>
                <t c="1934-9" d="Mountain Village"/>
                <t c="1159-3" d="Mowa Band of Choctaw"/>
                <t c="1522-2" d="Muckleshoot"/>
                <t c="1217-9" d="Munsee"/>
                <t c="1935-6" d="Naknek"/>
                <t c="1498-5" d="Nambe"/>
                <t c="2064-4" d="Namibian"/>
                <t c="1871-3" d="Nana Inupiat"/>
                <t c="1238-5" d="Nansemond"/>
                <t c="1378-9" d="Nanticoke"/>
                <t c="1937-2" d="Napakiak"/>
                <t c="1938-0" d="Napaskiak"/>
                <t c="1936-4" d="Napaumute"/>
                <t c="1380-5" d="Narragansett"/>
                <t c="1239-3" d="Natchez"/>
                <t c="2079-2" d="Native Hawaiian"/>
                <t c="2076-8" d="Native Hawaiian or Other Pacific Islander"/>
                <t c="1240-1" d="Nausu Waiwash"/>
                <t c="1382-1" d="Navajo"/>
                <t c="1475-3" d="Nebraska Ponca"/>
                <t c="1698-0" d="Nebraska Winnebago"/>
                <t c="2016-4" d="Nelson Lagoon"/>
                <t c="1783-0" d="Nenana"/>
                <t c="2050-3" d="Nepalese"/>
                <t c="2104-8" d="New Hebrides"/>
                <t c="1940-6" d="New Stuyahok"/>
                <t c="1939-8" d="Newhalen"/>
                <t c="1941-4" d="Newtok"/>
                <t c="1387-0" d="Nez Perce"/>
                <t c="2159-2" d="Nicaraguan"/>
                <t c="2065-1" d="Nigerian"/>
                <t c="1942-2" d="Nightmute"/>
                <t c="1784-8" d="Nikolai"/>
                <t c="2017-2" d="Nikolski"/>
                <t c="1785-5" d="Ninilchik"/>
                <t c="1241-9" d="Nipmuc"/>
                <t c="1346-6" d="Nishinam"/>
                <t c="1523-0" d="Nisqually"/>
                <t c="1872-1" d="Noatak"/>
                <t c="1389-6" d="Nomalaki"/>
                <t c="1873-9" d="Nome"/>
                <t c="1786-3" d="Nondalton"/>
                <t c="1524-8" d="Nooksack"/>
                <t c="1874-7" d="Noorvik"/>
                <t c="1022-3" d="Northern Arapaho"/>
                <t c="1095-9" d="Northern Cherokee"/>
                <t c="1103-1" d="Northern Cheyenne"/>
                <t c="1429-0" d="Northern Paiute"/>
                <t c="1469-6" d="Northern Pomo"/>
                <t c="1787-1" d="Northway"/>
                <t c="1391-2" d="Northwest Tribes"/>
                <t c="2186-5" d="Not Hispanic or Latino"/>
                <t c="1875-4" d="Nuiqsut"/>
                <t c="1788-9" d="Nulato"/>
                <t c="1943-0" d="Nunapitchukv"/>
                <t c="1622-0" d="Oglala Sioux"/>
                <t c="2043-8" d="Okinawan"/>
                <t c="1016-5" d="Oklahoma Apache"/>
                <t c="1042-1" d="Oklahoma Cado"/>
                <t c="1160-1" d="Oklahoma Choctaw"/>
                <t c="1176-7" d="Oklahoma Comanche"/>
                <t c="1218-7" d="Oklahoma Delaware"/>
                <t c="1306-0" d="Oklahoma Kickapoo"/>
                <t c="1310-2" d="Oklahoma Kiowa"/>
                <t c="1361-5" d="Oklahoma Miami"/>
                <t c="1414-2" d="Oklahoma Ottawa"/>
                <t c="1446-4" d="Oklahoma Pawnee"/>
                <t c="1451-4" d="Oklahoma Peoria"/>
                <t c="1476-1" d="Oklahoma Ponca"/>
                <t c="1554-5" d="Oklahoma Sac and Fox"/>
                <t c="1571-9" d="Oklahoma Seminole"/>
                <t c="1998-4" d="Old Harbor"/>
                <t c="1403-5" d="Omaha"/>
                <t c="1288-0" d="Oneida"/>
                <t c="1289-8" d="Onondaga"/>
                <t c="1140-3" d="Ontonagon"/>
                <t c="1405-0" d="Oregon Athabaskan"/>
                <t c="1407-6" d="Osage"/>
                <t c="1944-8" d="Oscarville"/>
                <t c="2500-7" d="Other Pacific Islander"/>
                <t c="2131-1" d="Other Race"/>
                <t c="1409-2" d="Otoe-Missouria"/>
                <t c="1411-8" d="Ottawa"/>
                <t c="1999-2" d="Ouzinkie"/>
                <t c="1430-8" d="Owens Valley"/>
                <t c="1416-7" d="Paiute"/>
                <t c="2044-6" d="Pakistani"/>
                <t c="1333-4" d="Pala"/>
                <t c="2091-7" d="Palauan"/>
                <t c="2124-6" d="Palestinian"/>
                <t c="1439-9" d="Pamunkey"/>
                <t c="2160-0" d="Panamanian"/>
                <t c="1592-5" d="Panamint"/>
                <t c="2102-2" d="Papua New Guinean"/>
                <t c="2171-7" d="Paraguayan"/>
                <t c="1713-7" d="Pascua Yaqui"/>
                <t c="1441-5" d="Passamaquoddy"/>
                <t c="1242-7" d="Paugussett"/>
                <t c="2018-0" d="Pauloff Harbor"/>
                <t c="1334-2" d="Pauma"/>
                <t c="1445-6" d="Pawnee"/>
                <t c="1017-3" d="Payson Apache"/>
                <t c="1335-9" d="Pechanga"/>
                <t c="1789-7" d="Pedro Bay"/>
                <t c="1828-3" d="Pelican"/>
                <t c="1448-0" d="Penobscot"/>
                <t c="1450-6" d="Peoria"/>
                <t c="1453-0" d="Pequot"/>
                <t c="1980-2" d="Perryville"/>
                <t c="2172-5" d="Peruvian"/>
                <t c="1829-1" d="Petersburg"/>
                <t c="1499-3" d="Picuris"/>
                <t c="1981-0" d="Pilot Point"/>
                <t c="1945-5" d="Pilot Station"/>
                <t c="1456-3" d="Pima"/>
                <t c="1623-8" d="Pine Ridge Sioux"/>
                <t c="1624-6" d="Pipestone Sioux"/>
                <t c="1500-8" d="Piro"/>
                <t c="1460-5" d="Piscataway"/>
                <t c="1462-1" d="Pit River"/>
                <t c="1946-3" d="Pitkas Point"/>
                <t c="1947-1" d="Platinum"/>
                <t c="1443-1" d="Pleasant Point Passamaquoddy"/>
                <t c="1201-3" d="Poarch Band"/>
                <t c="1243-5" d="Pocomoke Acohonock"/>
                <t c="2094-1" d="Pohnpeian"/>
                <t c="1876-2" d="Point Hope"/>
                <t c="1877-0" d="Point Lay"/>
                <t c="1501-6" d="Pojoaque"/>
                <t c="1483-7" d="Pokagon Potawatomi"/>
                <t c="2115-4" d="Polish"/>
                <t c="2078-4" d="Polynesian"/>
                <t c="1464-7" d="Pomo"/>
                <t c="1474-6" d="Ponca"/>
                <t c="1328-4" d="Poospatuck"/>
                <t c="1315-1" d="Port Gamble Klallam"/>
                <t c="1988-5" d="Port Graham"/>
                <t c="1982-8" d="Port Heiden"/>
                <t c="2000-8" d="Port Lions"/>
                <t c="1525-5" d="Port Madison"/>
                <t c="1948-9" d="Portage Creek"/>
                <t c="1478-7" d="Potawatomi"/>
                <t c="1487-8" d="Powhatan"/>
                <t c="1484-5" d="Prairie Band"/>
                <t c="1625-3" d="Prairie Island Sioux"/>
                <t c="1202-1" d="Principal Creek Indian Nation"/>
                <t c="1626-1" d="Prior Lake Sioux"/>
                <t c="1489-4" d="Pueblo"/>
                <t c="2180-8" d="Puerto Rican"/>
                <t c="1518-0" d="Puget Sound Salish"/>
                <t c="1526-3" d="Puyallup"/>
                <t c="1431-6" d="Pyramid Lake"/>
                <t c="2019-8" d="Qagan Toyagungin"/>
                <t c="2020-6" d="Qawalangin"/>
                <t c="1541-2" d="Quapaw"/>
                <t c="1730-1" d="Quechan"/>
                <t c="1084-3" d="Quileute"/>
                <t c="1543-8" d="Quinault"/>
                <t c="1949-7" d="Quinhagak"/>
                <t c="1000-9" d="Race"/>
                <t c="1385-4" d="Ramah Navajo"/>
                <t c="1790-5" d="Rampart"/>
                <t c="1219-5" d="Rampough Mountain"/>
                <t c="1545-3" d="Rappahannock"/>
                <t c="1141-1" d="Red Cliff Chippewa"/>
                <t c="1950-5" d="Red Devil"/>
                <t c="1142-9" d="Red Lake Chippewa"/>
                <t c="1061-1" d="Red Wood"/>
                <t c="1547-9" d="Reno-Sparks"/>
                <t c="1151-0" d="Rocky Boy's Chippewa Cree"/>
                <t c="1627-9" d="Rosebud Sioux"/>
                <t c="1549-5" d="Round Valley"/>
                <t c="1791-3" d="Ruby"/>
                <t c="1593-3" d="Ruby Valley"/>
                <t c="1551-1" d="Sac and Fox"/>
                <t c="1143-7" d="Saginaw Chippewa"/>
                <t c="2095-8" d="Saipanese"/>
                <t c="1792-1" d="Salamatof"/>
                <t c="1556-0" d="Salinan"/>
                <t c="1558-6" d="Salish"/>
                <t c="1560-2" d="Salish and Kootenai"/>
                <t c="1458-9" d="Salt River Pima-Maricopa"/>
                <t c="2161-8" d="Salvadoran"/>
                <t c="1527-1" d="Samish"/>
                <t c="2080-0" d="Samoan"/>
                <t c="1018-1" d="San Carlos Apache"/>
                <t c="1502-4" d="San Felipe"/>
                <t c="1503-2" d="San Ildefonso"/>
                <t c="1506-5" d="San Juan"/>
                <t c="1505-7" d="San Juan De"/>
                <t c="1504-0" d="San Juan Pueblo"/>
                <t c="1432-4" d="San Juan Southern Paiute"/>
                <t c="1574-3" d="San Manual"/>
                <t c="1229-4" d="San Pasqual"/>
                <t c="1656-8" d="San Xavier"/>
                <t c="1220-3" d="Sand Hill"/>
                <t c="2023-0" d="Sand Point"/>
                <t c="1507-3" d="Sandia"/>
                <t c="1628-7" d="Sans Arc Sioux"/>
                <t c="1508-1" d="Santa Ana"/>
                <t c="1509-9" d="Santa Clara"/>
                <t c="1062-9" d="Santa Rosa"/>
                <t c="1050-4" d="Santa Rosa Cahuilla"/>
                <t c="1163-5" d="Santa Ynez"/>
                <t c="1230-2" d="Santa Ysabel"/>
                <t c="1629-5" d="Santee Sioux"/>
                <t c="1510-7" d="Santo Domingo"/>
                <t c="1528-9" d="Sauk-Suiattle"/>
                <t c="1145-2" d="Sault Ste. Marie Chippewa"/>
                <t c="1893-7" d="Savoonga"/>
                <t c="1830-9" d="Saxman"/>
                <t c="1952-1" d="Scammon Bay"/>
                <t c="1562-8" d="Schaghticoke"/>
                <t c="1564-4" d="Scott Valley"/>
                <t c="2116-2" d="Scottish"/>
                <t c="1470-4" d="Scotts Valley"/>
                <t c="1878-8" d="Selawik"/>
                <t c="1793-9" d="Seldovia"/>
                <t c="1657-6" d="Sells"/>
                <t c="1566-9" d="Seminole"/>
                <t c="1290-6" d="Seneca"/>
                <t c="1291-4" d="Seneca Nation"/>
                <t c="1292-2" d="Seneca-Cayuga"/>
                <t c="1573-5" d="Serrano"/>
                <t c="1329-2" d="Setauket"/>
                <t c="1795-4" d="Shageluk"/>
                <t c="1879-6" d="Shaktoolik"/>
                <t c="1576-8" d="Shasta"/>
                <t c="1578-4" d="Shawnee"/>
                <t c="1953-9" d="Sheldon's Point"/>
                <t c="1582-6" d="Shinnecock"/>
                <t c="1880-4" d="Shishmaref"/>
                <t c="1584-2" d="Shoalwater Bay"/>
                <t c="1586-7" d="Shoshone"/>
                <t c="1602-2" d="Shoshone Paiute"/>
                <t c="1881-2" d="Shungnak"/>
                <t c="1891-1" d="Siberian Eskimo"/>
                <t c="1894-5" d="Siberian Yupik"/>
                <t c="1607-1" d="Siletz"/>
                <t c="2051-1" d="Singaporean"/>
                <t c="1609-7" d="Sioux"/>
                <t c="1631-1" d="Sisseton Sioux"/>
                <t c="1630-3" d="Sisseton-Wahpeton"/>
                <t c="1831-7" d="Sitka"/>
                <t c="1643-6" d="Siuslaw"/>
                <t c="1529-7" d="Skokomish"/>
                <t c="1594-1" d="Skull Valley"/>
                <t c="1530-5" d="Skykomish"/>
                <t c="1794-7" d="Slana"/>
                <t c="1954-7" d="Sleetmute"/>
                <t c="1531-3" d="Snohomish"/>
                <t c="1532-1" d="Snoqualmie"/>
                <t c="1336-7" d="Soboba"/>
                <t c="1146-0" d="Sokoagon Chippewa"/>
                <t c="1882-0" d="Solomon"/>
                <t c="2103-0" d="Solomon Islander"/>
                <t c="2165-9" d="South American"/>
                <t c="1073-6" d="South American Indian"/>
                <t c="2175-8" d="South American Indian"/>
                <t c="1595-8" d="South Fork Shoshone"/>
                <t c="2024-8" d="South Naknek"/>
                <t c="1811-9" d="Southeast Alaska"/>
                <t c="1244-3" d="Southeastern Indians"/>
                <t c="1023-1" d="Southern Arapaho"/>
                <t c="1104-9" d="Southern Cheyenne"/>
                <t c="1433-2" d="Southern Paiute"/>
                <t c="2137-8" d="Spaniard"/>
                <t c="1074-4" d="Spanish American Indian"/>
                <t c="2146-9" d="Spanish Basque"/>
                <t c="1632-9" d="Spirit Lake Sioux"/>
                <t c="1645-1" d="Spokane"/>
                <t c="1533-9" d="Squaxin Island"/>
                <t c="2045-3" d="Sri Lankan"/>
                <t c="1144-5" d="St. Croix Chippewa"/>
                <t c="2021-4" d="St. George"/>
                <t c="1963-8" d="St. Mary's"/>
                <t c="1951-3" d="St. Michael"/>
                <t c="2022-2" d="St. Paul"/>
                <t c="1633-7" d="Standing Rock Sioux"/>
                <t c="1203-9" d="Star Clan of Muscogee Creeks"/>
                <t c="1955-4" d="Stebbins"/>
                <t c="1534-7" d="Steilacoom"/>
                <t c="1796-2" d="Stevens"/>
                <t c="1647-7" d="Stewart"/>
                <t c="1535-4" d="Stillaguamish"/>
                <t c="1649-3" d="Stockbridge"/>
                <t c="1797-0" d="Stony River"/>
                <t c="1471-2" d="Stonyford"/>
                <t c="2002-4" d="Sugpiaq"/>
                <t c="1472-0" d="Sulphur Bank"/>
                <t c="1434-0" d="Summit Lake"/>
                <t c="2004-0" d="Suqpigaq"/>
                <t c="1536-2" d="Suquamish"/>
                <t c="1651-9" d="Susanville"/>
                <t c="1245-0" d="Susquehanock"/>
                <t c="1537-0" d="Swinomish"/>
                <t c="1231-0" d="Sycuan"/>
                <t c="2125-3" d="Syrian"/>
                <t c="1705-3" d="Table Bluff"/>
                <t c="1719-4" d="Tachi"/>
                <t c="2081-8" d="Tahitian"/>
                <t c="2035-4" d="Taiwanese"/>
                <t c="1063-7" d="Takelma"/>
                <t c="1798-8" d="Takotna"/>
                <t c="1397-9" d="Talakamish"/>
                <t c="1799-6" d="Tanacross"/>
                <t c="1800-2" d="Tanaina"/>
                <t c="1801-0" d="Tanana"/>
                <t c="1802-8" d="Tanana Chiefs"/>
                <t c="1511-5" d="Taos"/>
                <t c="1969-5" d="Tatitlek"/>
                <t c="1803-6" d="Tazlina"/>
                <t c="1804-4" d="Telida"/>
                <t c="1883-8" d="Teller"/>
                <t c="1338-3" d="Temecula"/>
                <t c="1596-6" d="Te-Moak Western Shoshone"/>
                <t c="1832-5" d="Tenakee Springs"/>
                <t c="1398-7" d="Tenino"/>
                <t c="1512-3" d="Tesuque"/>
                <t c="1805-1" d="Tetlin"/>
                <t c="1634-5" d="Teton Sioux"/>
                <t c="1513-1" d="Tewa"/>
                <t c="1307-8" d="Texas Kickapoo"/>
                <t c="2046-1" d="Thai"/>
                <t c="1204-7" d="Thlopthlocco"/>
                <t c="1514-9" d="Tigua"/>
                <t c="1399-5" d="Tillamook"/>
                <t c="1597-4" d="Timbi-Sha Shoshone"/>
                <t c="1833-3" d="Tlingit"/>
                <t c="1813-5" d="Tlingit-Haida"/>
                <t c="2073-5" d="Tobagoan"/>
                <t c="1956-2" d="Togiak"/>
                <t c="1653-5" d="Tohono O'Odham"/>
                <t c="1806-9" d="Tok"/>
                <t c="2083-4" d="Tokelauan"/>
                <t c="1957-0" d="Toksook"/>
                <t c="1659-2" d="Tolowa"/>
                <t c="1293-0" d="Tonawanda Seneca"/>
                <t c="2082-6" d="Tongan"/>
                <t c="1661-8" d="Tonkawa"/>
                <t c="1051-2" d="Torres-Martinez"/>
                <t c="2074-3" d="Trinidadian"/>
                <t c="1272-4" d="Trinity"/>
                <t c="1837-4" d="Tsimshian"/>
                <t c="1205-4" d="Tuckabachee"/>
                <t c="1538-8" d="Tulalip"/>
                <t c="1720-2" d="Tule River"/>
                <t c="1958-8" d="Tulukskak"/>
                <t c="1246-8" d="Tunica Biloxi"/>
                <t c="1959-6" d="Tuntutuliak"/>
                <t c="1960-4" d="Tununak"/>
                <t c="1147-8" d="Turtle Mountain"/>
                <t c="1294-8" d="Tuscarora"/>
                <t c="1096-7" d="Tuscola"/>
                <t c="1337-5" d="Twenty-Nine Palms"/>
                <t c="1961-2" d="Twin Hills"/>
                <t c="1635-2" d="Two Kettle Sioux"/>
                <t c="1663-4" d="Tygh"/>
                <t c="1807-7" d="Tyonek"/>
                <t c="1970-3" d="Ugashik"/>
                <t c="1672-5" d="Uintah Ute"/>
                <t c="1665-9" d="Umatilla"/>
                <t c="1964-6" d="Umkumiate"/>
                <t c="1667-5" d="Umpqua"/>
                <t c="1884-6" d="Unalakleet"/>
                <t c="2025-5" d="Unalaska"/>
                <t c="2006-5" d="Unangan Aleut"/>
                <t c="2026-3" d="Unga"/>
                <t c="1097-5" d="United Keetowah Band of Cherokee"/>
                <t c="1118-9" d="Upper Chinook"/>
                <t c="1636-0" d="Upper Sioux"/>
                <t c="1539-6" d="Upper Skagit"/>
                <t c="2173-3" d="Uruguayan"/>
                <t c="1670-9" d="Ute"/>
                <t c="1673-3" d="Ute Mountain Ute"/>
                <t c="1435-7" d="Utu Utu Gwaitu Paiute"/>
                <t c="2144-4" d="Valencian"/>
                <t c="1808-5" d="Venetie"/>
                <t c="2174-1" d="Venezuelan"/>
                <t c="2047-9" d="Vietnamese"/>
                <t c="1247-6" d="Waccamaw-Siousan"/>
                <t c="1637-8" d="Wahpekute Sioux"/>
                <t c="1638-6" d="Wahpeton Sioux"/>
                <t c="1675-8" d="Wailaki"/>
                <t c="1885-3" d="Wainwright"/>
                <t c="1119-7" d="Wakiakum Chinook"/>
                <t c="1886-1" d="Wales"/>
                <t c="1436-5" d="Walker River"/>
                <t c="1677-4" d="Walla-Walla"/>
                <t c="1679-0" d="Wampanoag"/>
                <t c="1064-5" d="Wappo"/>
                <t c="1683-2" d="Warm Springs"/>
                <t c="1685-7" d="Wascopum"/>
                <t c="1598-2" d="Washakie"/>
                <t c="1687-3" d="Washoe"/>
                <t c="1639-4" d="Wazhaza Sioux"/>
                <t c="1400-1" d="Wenatchee"/>
                <t c="2075-0" d="West Indian"/>
                <t c="1098-3" d="Western Cherokee"/>
                <t c="1110-6" d="Western Chickahominy"/>
                <t c="1273-2" d="Whilkut"/>
                <t c="2106-3" d="White"/>
                <t c="1148-6" d="White Earth"/>
                <t c="1887-9" d="White Mountain"/>
                <t c="1019-9" d="White Mountain Apache"/>
                <t c="1888-7" d="White Mountain Inupiat"/>
                <t c="1692-3" d="Wichita"/>
                <t c="1248-4" d="Wicomico"/>
                <t c="1120-5" d="Willapa Chinook"/>
                <t c="1694-9" d="Wind River"/>
                <t c="1024-9" d="Wind River Arapaho"/>
                <t c="1599-0" d="Wind River Shoshone"/>
                <t c="1696-4" d="Winnebago"/>
                <t c="1700-4" d="Winnemucca"/>
                <t c="1702-0" d="Wintun"/>
                <t c="1485-2" d="Wisconsin Potawatomi"/>
                <t c="1809-3" d="Wiseman"/>
                <t c="1121-3" d="Wishram"/>
                <t c="1704-6" d="Wiyot"/>
                <t c="1834-1" d="Wrangell"/>
                <t c="1295-5" d="Wyandotte"/>
                <t c="1401-9" d="Yahooskin"/>
                <t c="1707-9" d="Yakama"/>
                <t c="1709-5" d="Yakama Cowlitz"/>
                <t c="1835-8" d="Yakutat"/>
                <t c="1065-2" d="Yana"/>
                <t c="1640-2" d="Yankton Sioux"/>
                <t c="1641-0" d="Yanktonai Sioux"/>
                <t c="2098-2" d="Yapese"/>
                <t c="1711-1" d="Yaqui"/>
                <t c="1731-9" d="Yavapai"/>
                <t c="1715-2" d="Yavapai Apache"/>
                <t c="1437-3" d="Yerington Paiute"/>
                <t c="1717-8" d="Yokuts"/>
                <t c="1600-6" d="Yomba"/>
                <t c="1722-8" d="Yuchi"/>
                <t c="1066-0" d="Yuki"/>
                <t c="1724-4" d="Yuman"/>
                <t c="1896-0" d="Yupik Eskimo"/>
                <t c="1732-7" d="Yurok"/>
                <t c="2066-9" d="Zairean"/>
                <t c="1515-6" d="Zia"/>
                <t c="1516-4" d="Zuni"/>
            </TableDefinition>
            
<!-- =================================================================================================================== -->
            
            <TableDefinition description="PH_AdministrativeSex_HL7_2x" Id="HL70001" Name="Administrative sex (HL7)">
                <t c="A" d="Ambiguous"/>
                <t c="F" d="Female"/>
                <t c="M" d="Male"/>
                <t c="N" d="Not applicable"/>
                <t c="O" d="Other"/>
                <t c="U" d="Unknown"/>
            </TableDefinition>

         
<!-- =================================================================================================================== -->

            <TableDefinition Codesys="PHVS_AdministrativeSex_HL7_2x" Id="PHVS_AdministrativeSex_HL7_2x" Name="Administrative Sex (HL7)" Oid="2.16.840.1.114222.4.11.927" Type="Local" Version="1">
                <t c="A" d="Ambiguous"/>
                <t c="F" d="Female"/>
                <t c="M" d="Male"/>
                <t c="N" d="Not applicable"/>
                <t c="O" d="Other"/>
                <t c="U" d="Unknown"/>
            </TableDefinition>

         
<!-- =================================================================================================================== -->

            <TableDefinition Codesys="PHVS_ObservationIdentifier_SyndromicSurveillance" Id="Observation Identifier Syndromic Surveillance" Name="Observation Identifier (Syndromic Surveillance)" Oid="2.16.840.1.114222.4.11.3589" Type="Local" Version="2">
                <t c="SS003" d="Facility / Visit Type"/>
                <t c="21612-7" d="Age Time Patient Reported"/>
                <t c="8661-1" d="Chief complaint:Find:Pt:Patient:Nom:Reported"/>
                <t c="8302-2" d="Height"/>
                <t c="3141-9" d="Weight"/>
                <t c="72166-2" d="Tobacco Smoking Status"/>
                <t c="56816-2" d="Patient Location/ Hospital Unit"/>
                <t c="11289-6" d="Body temperature:Temp:Enctrfrst:Patient:Qn:"/>
                <t c="44833-2" d="Diagnosis.preliminary:Imp:Pt:Patient:Nom:"/>
                <t c="11368-8" d="Illness or injury onset date and time:TmStp:Pt:Patient:Qn:"/>
                <t c="59408-5" d="Oxygen saturation:MFr:Pt:BldA:Qn:Pulse oximetry"/>
                <t c="SS001" d="Treating Facility Identifier"/>
                <t c="SS002" d="Treating Facility Location"/>
                <t c="54094-8" d="Triage note:Find:Pt:Emergency department:Doc:"/>
            </TableDefinition>
        
        
   <!-- =================================================================================================================== -->
            <TableDefinition Codesys="PH_DischargeDisposition_HL7_2x" Id="HL70112" Name="Discharge disposition (HL7)" Oid="2.16.840.1.113883.12.112" Type="HL7" Version="HL7 v2.5">
                <t c="09" d="Admitted as an inpatient to this hospital"/>
                <t c="01" d="Discharged to home or self care (routine discharge)"/>
                <t c="66" d="Discharged/transferred to a Critical Access Hospital (CAH). (Effective 1/1/06)"/>
                <t c="43" d="Discharged/transferred to a federal health care facility. (Effective 10/1/03)"/>
                <t c="63" d="Discharged/transferred to a Medicare certified long term care hospital (LTCH).(Effective 5/9/02.)"/>
                <t c="64" d="Discharged/transferred to a nursing facility certified under Medicaid but not certified under Medicare. (Effective 10/1/02.)"/>
                <t c="65" d="Discharged/transferred to a psychiatric hospital or psychiatric distinct part unit of a hospital. (Effective 4/1/04)"/>
                <t c="02" d="Discharged/transferred to a short-term general hospital for inpatient care"/>
                <t c="62" d="Discharged/transferred to an inpatient rehabilitation facility (IRF) including rehabilitation distinct part units of a hospital. (Effective retroactive to 1/1/02.)"/>
                <t c="04" d="Discharged/transferred to an intermediate care facility (ICF)"/>
                <t c="05" d="Discharged/transferred to another type of institution not defined elsewhere in this code list"/>
                <t c="08" d="Discharged/transferred to home under care of a Home IV provider"/>
                <t c="06" d="Discharged/transferred to home under care of organized home health service organization"/>
                <t c="61" d="Discharged/transferred to hospital-based Medicare approved swing bed"/>
                <t c="03" d="Discharged/transferred to skilled nursing facility (SNF) with Medicare certification."/>
                <t c="20" d="Expired"/>
                <t c="42" d="Expired - place unknown"/>
                <t c="40" d="Expired at home"/>
                <t c="41" d="Expired in a medical facility (e.g. hospital, SNF, ICF, or free standing hospice)"/>
                <t c="50" d="Hospice - home"/>
                <t c="51" d="Hospice - medical facility"/>
                <t c="07" d="Left against medical advice or discontinued care"/>
                <t c="44-49" d="Reserved for national assignment"/>
                <t c="52-60" d="Reserved for national assignment"/>
                <t c="67-70" d="Reserved for national assignment"/>
                <t c="73-99" d="Reserved for national assignment"/>
                <t c="10-19" d="Reserved for national assignment (Discontinued effective 10/16/03)"/>
                <t c="2l-29" d="Reserved for national assignment (Discontinued effective 10/16/03)"/>
                <t c="31-39" d="Reserved for national assignment (Discontinued effective 10/16/03)"/>
                <t c="71" d="Reserved for national assignment (Discontinued effective 4/1/03)"/>
                <t c="72" d="Reserved for national assignment (Discontinued effective 4/1/03)"/>
                <t c="30" d="Still Patient"/>
            </TableDefinition>
           
<!-- =================================================================================================================== -->
          
            
            <TableDefinition IdNumber="0200" Type="HL7" Name="Name type" Id="HL70200" Codesys="HL7 v2.5.1">
                <t Source="HL7 V2.5.1 " d="Alias Name" c="A"/>
                <t Source="HL7 V2.5.1 " d="Name at Birth" c="B"/>
                <t Source="HL7 V2.5.1 " d="Adopted Name" c="C"/>
                <t Source="HL7 V2.5.1 " d="Display Name" c="D"/>
                <t Source="HL7 V2.5.1 " d="Licensing Name" c="I"/>
                <t Source="HL7 V2.5.1 " d="Legal Name" c="L"/>
                <t Source="HL7 V2.5.1 " d="Maiden Name" c="M"/>
                <t Source="HL7 V2.5.1 " d="Nickname/ Call me Name/Street Name" c="N"/>
                <t Source="HL7 V2.5.1 " d="Name of Partner/Spouse (retained for backward compatibility only)" c="P"/>
                <t Source="HL7 V2.5.1 " d="Registered Name (animals only)" c="R"/>
                <t Source="HL7 V2.5.1 " d="Coded Pseudo-Name to ensure anonymity" c="S"/>
                <t Source="HL7 V2.5.1 " d="Indigenous/Tribal/Community Name" c="T"/>
                <t Source="HL7 V2.5.1 " d="Unspecified" c="U"/>
            </TableDefinition>

       
        
<!-- =================================================================================================================== -->

            <TableDefinition description="PH_ImmunizationRegistryStatus_HL7_2x" Id="HL70441" Name="Immunization Registry Status (HL7)">
                <t c="A" d="Active"/>
                <t c="I" d="Inactive"/>
                <t c="L" d="Inactive - Lost to follow-up (cancel contract)"/>
                <t c="M" d="Inactive - Moved or gone elsewhere (cancel contract)"/>
                <t c="P" d="Inactive - Permanently inactive (Do not reactivate or add new entries to the record)"/>
                <t c="O" d="Other"/>
                <t c="U" d="Unknown"/>
            </TableDefinition>

<!-- =================================================================================================================== -->

            <TableDefinition Codesys="PH_ObservationResultStatus_HL7_2x" Id="HL70085" Name="Observation result status (HL7)">
                <t c="D" d="Deletes the OBX record"/>
                <t c="F" d="Final results; Can only be changed with a corrected result."/>
                <t c="N" d="Not asked; used to affirmatively document that the observation identified in the OBX was not sought when the universal service ID in OBR-4 implies that it would be sought."/>
                <t c="O" d="Order detail description only (no result)"/>
                <t c="S" d="Partial results"/>
                <t c="W" d="Post original as wrong, e.g., transmitted for wrong patient"/>
                <t c="P" d="Preliminary results"/>
                <t c="C" d="Record coming over is a correction and thus replaces a final result"/>
                <t c="X" d="Results cannot be obtained for this observation"/>
                <t c="R" d="Results entered -- not verified"/>
                <t c="U" d="Results status change to final without retransmitting results already sent as _preliminary._  E.g., radiology changes status from preliminary to final"/>
                <t c="I" d="Specimen in lab; results pending"/>
            </TableDefinition>
            
<!-- =================================================================================================================== -->

         <TableDefinition Codesys="PHVS_State_FIPS_5-2" Id="PHVS_State_FIPS_5-2" Name="State" Oid="2.16.840.1.114222.4.11.830" Type="FIPS 5-2" Version="1">
			<t c="01" d="Alabama"/>
			<t c="02" d="Alaska"/>
			<t c="60" d="American Samoa"/>
			<t c="04" d="Arizona"/>
			<t c="05" d="Arkansas"/>
			<t c="81" d="Baker Island"/>
			<t c="06" d="California"/>
			<t c="08" d="Colorado"/>
			<t c="09" d="Connecticut"/>
			<t c="10" d="Delaware"/>
			<t c="11" d="District of Columbia"/>
			<t c="64" d="Federated States of Micronesia"/>
			<t c="12" d="Florida"/>
			<t c="13" d="Georgia"/>
			<t c="66" d="Guam"/>
			<t c="15" d="Hawaii"/>
			<t c="84" d="Howland Island"/>
			<t c="16" d="Idaho"/>
			<t c="17" d="Illinois"/>
			<t c="18" d="Indiana"/>
			<t c="19" d="Iowa"/>
			<t c="86" d="Jarvis Island"/>
			<t c="67" d="Johnston Atoll"/>
			<t c="20" d="Kansas"/>
			<t c="21" d="Kentucky"/>
			<t c="89" d="Kingman Reef"/>
			<t c="22" d="Louisiana"/>
			<t c="23" d="Maine"/>
			<t c="68" d="Marshall Islands"/>
			<t c="24" d="Maryland"/>
			<t c="25" d="Massachusetts"/>
			<t c="26" d="Michigan"/>
			<t c="71" d="Midway Islands"/>
			<t c="27" d="Minnesota"/>
			<t c="28" d="Mississippi"/>
			<t c="29" d="Missouri"/>
			<t c="30" d="Montana"/>
			<t c="76" d="Navassa Island"/>
			<t c="31" d="Nebraska"/>
			<t c="32" d="Nevada"/>
			<t c="33" d="New Hampshire"/>
			<t c="34" d="New Jersey"/>
			<t c="35" d="New Mexico"/>
			<t c="36" d="New York"/>
			<t c="37" d="North Carolina"/>
			<t c="38" d="North Dakota"/>
			<t c="69" d="Northern Mariana Islands"/>
			<t c="39" d="Ohio"/>
			<t c="40" d="Oklahoma"/>
			<t c="41" d="Oregon"/>
			<t c="70" d="Palau"/>
			<t c="95" d="Palmyra Atoll"/>
			<t c="42" d="Pennsylvania"/>
			<t c="72" d="Puerto Rico"/>
			<t c="44" d="Rhode Island"/>
			<t c="45" d="South Carolina"/>
			<t c="46" d="South Dakota"/>
			<t c="47" d="Tennessee"/>
			<t c="48" d="Texas"/>
			<t c="74" d="U.S. Minor Outlying Islands"/>
			<t c="49" d="Utah"/>
			<t c="50" d="Vermont"/>
			<t c="78" d="Virgin Islands of the U.S."/>
			<t c="51" d="Virginia"/>
			<t c="79" d="Wake Island"/>
			<t c="53" d="Washington"/>
			<t c="54" d="West Virginia"/>
			<t c="55" d="Wisconsin"/>
			<t c="56" d="Wyoming"/>
         </TableDefinition>

<!-- =================================================================================================================== -->

         <TableDefinition Codesys="PHVS_Country_ISO_3166-1" Id="PHVS_Country_ISO_3166-1" Name="Country" Oid="2.16.840.1.114222.4.11.828" Type="ISO_3166-1" Version="1">
			<t c="AFG" d="AFGHANISTAN"/>
			<t c="ALA" d="ÅLAND ISLANDS"/>
			<t c="ALB" d="ALBANIA"/>
			<t c="DZA" d="ALGERIA"/>
			<t c="ASM" d="AMERICAN SAMOA"/>
			<t c="AND" d="ANDORRA"/>
			<t c="AGO" d="ANGOLA"/>
			<t c="AIA" d="ANGUILLA"/>
			<t c="ATA" d="ANTARCTICA"/>
			<t c="ATG" d="ANTIGUA AND BARBUDA"/>
			<t c="ARG" d="ARGENTINA"/>
			<t c="ARM" d="ARMENIA"/>
			<t c="ABW" d="ARUBA"/>
			<t c="AUS" d="AUSTRALIA"/>
			<t c="AUT" d="AUSTRIA"/>
			<t c="AZE" d="AZERBAIJAN"/>
			<t c="BHS" d="BAHAMAS"/>
			<t c="BHR" d="BAHRAIN"/>
			<t c="BGD" d="BANGLADESH"/>
			<t c="BRB" d="BARBADOS"/>
			<t c="BLR" d="BELARUS"/>
			<t c="BEL" d="BELGIUM"/>
			<t c="BLZ" d="BELIZE"/>
			<t c="BEN" d="BENIN"/>
			<t c="BMU" d="BERMUDA"/>
			<t c="BTN" d="BHUTAN"/>
			<t c="BOL" d="BOLIVIA"/>
			<t c="BIH" d="BOSNIA AND HERZEGOVINA"/>
			<t c="BWA" d="BOTSWANA"/>
			<t c="BVT" d="BOUVET ISLAND"/>
			<t c="BRA" d="BRAZIL"/>
			<t c="IOT" d="BRITISH INDIAN OCEAN TERRITORY"/>
			<t c="BRN" d="BRUNEI DARUSSALAM"/>
			<t c="BGR" d="BULGARIA"/>
			<t c="BFA" d="BURKINA FASO"/>
			<t c="BDI" d="BURUNDI"/>
			<t c="KHM" d="CAMBODIA"/>
			<t c="CMR" d="CAMEROON"/>
			<t c="CAN" d="CANADA"/>
			<t c="CPV" d="CAPE VERDE"/>
			<t c="CYM" d="CAYMAN ISLANDS"/>
			<t c="CAF" d="CENTRAL AFRICAN REPUBLIC"/>
			<t c="TCD" d="CHAD"/>
			<t c="CHL" d="CHILE"/>
			<t c="CHN" d="CHINA"/>
			<t c="CXR" d="CHRISTMAS ISLAND"/>
			<t c="CCK" d="COCOS (KEELING) ISLANDS"/>
			<t c="COL" d="COLOMBIA"/>
			<t c="COM" d="COMOROS"/>
			<t c="COG" d="CONGO"/>
			<t c="COD" d="CONGO, THE DEMOCRATIC REPUBLIC OF THE"/>
			<t c="COK" d="COOK ISLANDS"/>
			<t c="CRI" d="COSTA RICA"/>
			<t c="CIV" d="CÔTE D'IVOIRE"/>
			<t c="HRV" d="CROATIA"/>
			<t c="CUB" d="CUBA"/>
			<t c="CYP" d="CYPRUS"/>
			<t c="CZE" d="CZECH REPUBLIC"/>
			<t c="DNK" d="DENMARK"/>
			<t c="DJI" d="DJIBOUTI"/>
			<t c="DMA" d="DOMINICA"/>
			<t c="DOM" d="DOMINICAN REPUBLIC"/>
			<t c="ECU" d="ECUADOR"/>
			<t c="EGY" d="EGYPT"/>
			<t c="SLV" d="EL SALVADOR"/>
			<t c="GNQ" d="EQUATORIAL GUINEA"/>
			<t c="ERI" d="ERITREA"/>
			<t c="EST" d="ESTONIA"/>
			<t c="ETH" d="ETHIOPIA"/>
			<t c="FLK" d="FALKLAND ISLANDS (MALVINAS)"/>
			<t c="FRO" d="FAROE ISLANDS"/>
			<t c="FJI" d="FIJI"/>
			<t c="FIN" d="FINLAND"/>
			<t c="FRA" d="FRANCE"/>
			<t c="GUF" d="FRENCH GUIANA"/>
			<t c="PYF" d="FRENCH POLYNESIA"/>
			<t c="ATF" d="FRENCH SOUTHERN TERRITORIES"/>
			<t c="GAB" d="GABON"/>
			<t c="GMB" d="GAMBIA"/>
			<t c="GEO" d="GEORGIA"/>
			<t c="DEU" d="GERMANY"/>
			<t c="GHA" d="GHANA"/>
			<t c="GIB" d="GIBRALTAR"/>
			<t c="GRC" d="GREECE"/>
			<t c="GRL" d="GREENLAND"/>
			<t c="GRD" d="GRENADA"/>
			<t c="GLP" d="GUADELOUPE"/>
			<t c="GUM" d="GUAM"/>
			<t c="GTM" d="GUATEMALA"/>
			<t c="GGY" d="GUERNSEY"/>
			<t c="GIN" d="GUINEA"/>
			<t c="GNB" d="GUINEA-BISSAU"/>
			<t c="GUY" d="GUYANA"/>
			<t c="HTI" d="HAITI"/>
			<t c="HMD" d="HEARD ISLAND AND MCDONALD ISLANDS"/>
			<t c="VAT" d="HOLY SEE (VATICAN CITY STATE)"/>
			<t c="HND" d="HONDURAS"/>
			<t c="HKG" d="HONG KONG"/>
			<t c="HUN" d="HUNGARY"/>
			<t c="ISL" d="ICELAND"/>
			<t c="IND" d="INDIA"/>
			<t c="IDN" d="INDONESIA"/>
			<t c="IRN" d="IRAN, ISLAMIC REPUBLIC OF"/>
			<t c="IRQ" d="IRAQ"/>
			<t c="IRL" d="IRELAND"/>
			<t c="IMN" d="ISLE OF MAN"/>
			<t c="ISR" d="ISRAEL"/>
			<t c="ITA" d="ITALY"/>
			<t c="JAM" d="JAMAICA"/>
			<t c="JPN" d="JAPAN"/>
			<t c="JEY" d="JERSEY"/>
			<t c="JOR" d="JORDAN"/>
			<t c="KAZ" d="KAZAKHSTAN"/>
			<t c="KEN" d="KENYA"/>
			<t c="KIR" d="KIRIBATI"/>
			<t c="PRK" d="KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF"/>
			<t c="KOR" d="KOREA, REPUBLIC OF"/>
			<t c="KWT" d="KUWAIT"/>
			<t c="KGZ" d="KYRGYZSTAN"/>
			<t c="LAO" d="LAO PEOPLE'S DEMOCRATIC REPUBLIC"/>
			<t c="LVA" d="LATVIA"/>
			<t c="LBN" d="LEBANON"/>
			<t c="LSO" d="LESOTHO"/>
			<t c="LBR" d="LIBERIA"/>
			<t c="LBY" d="LIBYAN ARAB JAMAHIRIYA"/>
			<t c="LIE" d="LIECHTENSTEIN"/>
			<t c="LTU" d="LITHUANIA"/>
			<t c="LUX" d="LUXEMBOURG"/>
			<t c="MAC" d="MACAO"/>
			<t c="MKD" d="MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF"/>
			<t c="MDG" d="MADAGASCAR"/>
			<t c="MWI" d="MALAWI"/>
			<t c="MYS" d="MALAYSIA"/>
			<t c="MDV" d="MALDIVES"/>
			<t c="MLI" d="MALI"/>
			<t c="MLT" d="MALTA"/>
			<t c="MHL" d="MARSHALL ISLANDS"/>
			<t c="MTQ" d="MARTINIQUE"/>
			<t c="MRT" d="MAURITANIA"/>
			<t c="MUS" d="MAURITIUS"/>
			<t c="MYT" d="MAYOTTE"/>
			<t c="MEX" d="MEXICO"/>
			<t c="FSM" d="MICRONESIA, FEDERATED STATES OF"/>
			<t c="MDA" d="MOLDOVA, REPUBLIC OF"/>
			<t c="MCO" d="MONACO"/>
			<t c="MNG" d="MONGOLIA"/>
			<t c="MNE" d="MONTENEGRO"/>
			<t c="MSR" d="MONTSERRAT"/>
			<t c="MAR" d="MOROCCO"/>
			<t c="MOZ" d="MOZAMBIQUE"/>
			<t c="MMR" d="MYANMAR"/>
			<t c="NAM" d="NAMIBIA"/>
			<t c="NRU" d="NAURU"/>
			<t c="NPL" d="NEPAL"/>
			<t c="NLD" d="NETHERLANDS"/>
			<t c="ANT" d="NETHERLANDS ANTILLES"/>
			<t c="NCL" d="NEW CALEDONIA"/>
			<t c="NZL" d="NEW ZEALAND"/>
			<t c="NIC" d="NICARAGUA"/>
			<t c="NER" d="NIGER"/>
			<t c="NGA" d="NIGERIA"/>
			<t c="NIU" d="NIUE"/>
			<t c="NFK" d="NORFOLK ISLAND"/>
			<t c="MNP" d="NORTHERN MARIANA ISLANDS"/>
			<t c="NOR" d="NORWAY"/>
			<t c="OMN" d="OMAN"/>
			<t c="PAK" d="PAKISTAN"/>
			<t c="PLW" d="PALAU"/>
			<t c="PSE" d="PALESTINIAN TERRITORY, OCCUPIED"/>
			<t c="PAN" d="PANAMA"/>
			<t c="PNG" d="PAPUA NEW GUINEA"/>
			<t c="PRY" d="PARAGUAY"/>
			<t c="PER" d="PERU"/>
			<t c="PHL" d="PHILIPPINES"/>
			<t c="PCN" d="PITCAIRN"/>
			<t c="POL" d="POLAND"/>
			<t c="PRT" d="PORTUGAL"/>
			<t c="PRI" d="PUERTO RICO"/>
			<t c="QAT" d="QATAR"/>
			<t c="REU" d="RÉUNION"/>
			<t c="ROU" d="ROMANIA"/>
			<t c="RUS" d="RUSSIAN FEDERATION"/>
			<t c="RWA" d="RWANDA"/>
			<t c="BLM" d="SAINT BARTHÉLEMY"/>
			<t c="SHN" d="SAINT HELENA"/>
			<t c="KNA" d="SAINT KITTS AND NEVIS"/>
			<t c="LCA" d="SAINT LUCIA"/>
			<t c="MAF" d="SAINT MARTIN (FRENCH PART)"/>
			<t c="SPM" d="SAINT PIERRE AND MIQUELON"/>
			<t c="VCT" d="SAINT VINCENT AND THE GRENADINES"/>
			<t c="WSM" d="SAMOA"/>
			<t c="SMR" d="SAN MARINO"/>
			<t c="STP" d="SAO TOME AND PRINCIPE"/>
			<t c="SAU" d="SAUDI ARABIA"/>
			<t c="SEN" d="SENEGAL"/>
			<t c="SRB" d="SERBIA"/>
			<t c="SYC" d="SEYCHELLES"/>
			<t c="SLE" d="SIERRA LEONE"/>
			<t c="SGP" d="SINGAPORE"/>
			<t c="SVK" d="SLOVAKIA"/>
			<t c="SVN" d="SLOVENIA"/>
			<t c="SLB" d="SOLOMON ISLANDS"/>
			<t c="SOM" d="SOMALIA"/>
			<t c="ZAF" d="SOUTH AFRICA"/>
			<t c="SGS" d="SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS"/>
			<t c="ESP" d="SPAIN"/>
			<t c="LKA" d="SRI LANKA"/>
			<t c="SDN" d="SUDAN"/>
			<t c="SUR" d="SURINAME"/>
			<t c="SJM" d="SVALBARD AND JAN MAYEN"/>
			<t c="SWZ" d="SWAZILAND"/>
			<t c="SWE" d="SWEDEN"/>
			<t c="CHE" d="SWITZERLAND"/>
			<t c="SYR" d="SYRIAN ARAB REPUBLIC"/>
			<t c="TWN" d="TAIWAN, PROVINCE OF CHINA"/>
			<t c="TJK" d="TAJIKISTAN"/>
			<t c="TZA" d="TANZANIA, UNITED REPUBLIC OF"/>
			<t c="THA" d="THAILAND"/>
			<t c="TLS" d="TIMOR-LESTE"/>
			<t c="TGO" d="TOGO"/>
			<t c="TKL" d="TOKELAU"/>
			<t c="TON" d="TONGA"/>
			<t c="TTO" d="TRINIDAD AND TOBAGO"/>
			<t c="TUN" d="TUNISIA"/>
			<t c="TUR" d="TURKEY"/>
			<t c="TKM" d="TURKMENISTAN"/>
			<t c="TCA" d="TURKS AND CAICOS ISLANDS"/>
			<t c="TUV" d="TUVALU"/>
			<t c="UGA" d="UGANDA"/>
			<t c="UKR" d="UKRAINE"/>
			<t c="ARE" d="UNITED ARAB EMIRATES"/>
			<t c="GBR" d="UNITED KINGDOM"/>
			<t c="USA" d="UNITED STATES"/>
			<t c="UMI" d="UNITED STATES MINOR OUTLYING ISLANDS"/>
			<t c="URY" d="URUGUAY"/>
			<t c="UZB" d="UZBEKISTAN"/>
			<t c="VUT" d="VANUATU"/>
			<t c="VEN" d="VENEZUELA"/>
			<t c="VNM" d="VIET NAM"/>
			<t c="VGB" d="VIRGIN ISLANDS, BRITISH"/>
			<t c="VIR" d="VIRGIN ISLANDS, U.S."/>
			<t c="WLF" d="WALLIS AND FUTUNA"/>
			<t c="ESH" d="WESTERN SAHARA"/>
			<t c="YEM" d="YEMEN"/>
			<t c="ZMB" d="ZAMBIA"/>
			<t c="ZWE" d="ZIMBABWE"/>
		</TableDefinition>
		
		

         <!-- =================================================================================================================== -->

         <TableDefinition Codesys="PHVS_AdministrativeDiagnosis_CDC_ICD-9CM" Id="PHVS_AdministrativeDiagnosis_CDC_ICD-9CM" Name="Diagnosis (ICD-9 CM)" Oid="2.16.840.1.114222.4.11.856" Type="ICD-9 CM" Version="1">
		<t c="4871" d="Flu w resp manifest NEC"/>
		<t c="4870" d="Influenza with pneumonia"/>
						 
        </TableDefinition>


         <!-- =================================================================================================================== -->

         <TableDefinition Codesys="PHVS_CauseOfDeath_ICD-10_CDC" Id="PHVS_CauseOfDeath_ICD-10_CDC" Name="Cause of Death (ICD-10) " Oid="2.16.840.1.114222.4.11.828" Type="ICD-10" Version="1">
        </TableDefinition>

         <TableDefinition Codesys="PHVS_Disease_CDC" Id="PHVS_Disease_CDC" Name="Disease" Oid="2.16.840.1.114222.4.11.909" Type="SNOMED" Version="1">
        </TableDefinition>
        
        
        
        <TableDefinition Codesys="PHVS_PatientClass_SyndromicSurveillance" Id="PHVS_PatientClass_SyndromicSurveillance" Name="Patient Class (Syndromic Surveillance) " Oid="2.16.840.1.114222.4.11.3404" Type="Local" Version="1">
			<t c="D" d="Direct admit"/>
			<t c="E" d="Emergency"/>
			<t c="I" d="Inpatient"/>
			<t c="V" d="Observation patient"/>
			<t c="B" d="Obstetrics"/>
			<t c="O" d="Outpatient"/>
			<t c="P" d="Preadmit"/>
			<t c="R" d="Recurring patient"/>
	</TableDefinition>

	<TableDefinition Codesys="PHVS_HeightUnit_UCUM" Id="PHVS_HeightUnit_UCUM" Name="Height Unit" Oid="2.16.840.1.114222.4.11.891" Type="Local" Version="1">
		<t c="cm" d="CentiMeter [SI Length Units]"/>
		<t c="[ft_us]" d="foot"/>	
		<t c="[in_us]" d="inch"/>	
		<t c="m" d="meter"/>		
	</TableDefinition>
	
		<TableDefinition Codesys="PHVS_WeightUnit_UCUM" Id="PHVS_WeightUnit_UCUM" Name="Weight Unit" Oid="2.16.840.1.114222.4.11.879" Type="Local" Version="1" ConceptType="Preferred Concept Name">
			<t c="g" d="gram"/>
			<t c="kg" d="KiloGram [SI Mass Units]"/>
			<t c="[oz_av]" d="ounce"/>
			<t c="[lb_av]" d="pound"/>
		</TableDefinition>

		<TableDefinition Codesys="PHVS_SmokingStatus_MU" Id="PHVS_SmokingStatus_MU" Name="Smoking Status" Oid="2.16.840.1.114222.4.11.6027" Type="Local" Version="1" ConceptType="Preferred Concept Name">
			<t c="428071000124103" d="Current Heavy tobacco smoker"/>
			<t c="428061000124105" d="Current Light tobacco smoker"/>
			<t c="428041000124106" d="Current some day smoker"/>
			<t c="8517006" d="Former smoker"/>
			<t c="266919005" d="Never smoker"/>
			<t c="77176002" d="Smoker, current status unknown"/>
			<t c="449868002" d="Current every day smoker"/>
			<t c="266927001" d="Unknown if ever smoked"/>
		</TableDefinition>


		<TableDefinition Codesys="PHVS_FacilityVisitType_SyndromicSurveillance" Id="PHVS_FacilityVisitType_SyndromicSurveillance" Name="Facility / Visit Type (Syndromic Surveillance)" Oid="2.16.840.1.114222.4.11.3401" Type="Local" Version="1" ConceptType="Preferred Concept Name">
			<t c="261QE0002X" d="Emergency Care"/>
			<t c="1021-5" d="Inpatient practice setting"/>
			<t c="261QM2500X" d="Medical Specialty"/>
			<t c="261QP2300X" d="Primary Care"/>
			<t c="261QU0200X" d="Urgent Care"/>
		</TableDefinition>	

        </Tables>
    </xsl:variable>
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!-- - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - -->
	<!--  to nullify the effects of the unmatched segments due to apply-templates -->
	<xsl:template match="*" mode="Syndromic">
	</xsl:template>
	<xsl:template match="*" mode="LRI">
	</xsl:template>
</xsl:stylesheet>