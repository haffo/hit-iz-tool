<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:report="http://www.nist.gov/healthcare/validation/message/hl7/v3/report" xmlns:message="http://www.nist.gov/healthcare/generation/message" xmlns:context="http://www.nist.gov/healthcare/validation/message/hl7/v3/context" xmlns:profile="http://www.nist.gov/healthcare/profile" xmlns:map="urn:internal" exclude-result-prefixes="map">
	<xsl:output method="html"/> 
	<xsl:param name="mvrErrorsDisplay" select="'block'"/>
	<xsl:param name="mvrAffirmativesDisplay" select="'block'"/>
	<xsl:param name="mvrWarningsDisplay" select="'block'"/>
	<xsl:param name="mvrIgnoredDisplay" select="'none'"/>
	<xsl:param name="mvrAlertsDisplay" select="'block'"/>
	<xsl:param name="msgContentDisplay" select="'block'"/>
	
	<xsl:param name="maintitle">Message Validation Report</xsl:param>
	<xsl:template match="report:HL7V3MessageValidationReport">
		<xsl:apply-templates select="report:HeaderReport"/>
		<xsl:apply-templates select="report:SpecificReport"/>
	</xsl:template>
	<xsl:template match="report:HeaderReport">
		<!-- Header -->
		<div id="mvrTitle" style="display:block;">
			<table width="100%" cellpadding="2" cellspacing="1" border="0" class="forumline">
				<tr> 
					<td>
						<font class="maintitle">
							<xsl:value-of select="$maintitle"/>
						</font>
					</td>
					<td align="right">
						Date:
						<xsl:call-template name="dateTransformer">
							<xsl:with-param name="myDate" select="message:DateOfTest"/>
							<xsl:with-param name="myTime" select="message:TimeOfTest"/>
						</xsl:call-template>
					</td>
				</tr>
			</table>
		</div>
	</xsl:template>
	<xsl:template match="report:SpecificReport">
		<!-- Profile 
		<div id="mvrProfileBox" style="display:block;">
			<br/>
			<table width="100%" cellpadding="2" cellspacing="1" border="0" class="forumline">
				<xsl:apply-templates select="report:MetaData/report:Profile"/>
			</table>
		</div> -->
		<!-- 
		<div id="mvrValidationContextBox" style="display:block;">
			<br/>
			<table width="100%" cellpadding="2" cellspacing="1" border="0" class="forumline">
				 <tr>
					<td class="row1" rowspan="4" valign="top">
						Validation Context
						<br/>
					</td>
					<td class="row2">Name</td>
					<td class="row3"> 
						<xsl:call-template name="FileName">
							<xsl:with-param name="path" select="../report:HeaderReport/message:ValidationObjectReferenceList/message:ValidationObjectReference[@Type='Validation Context']"/>
						</xsl:call-template>
					</td>
				</tr>
			</table> 
		</div> --> 
		<!-- Message -->
		<!-- <div id="mvrMessageBox" style="display:block;">
			<br/>
			<table width="100%" cellpadding="2" cellspacing="1" border="0" class="forumline">
				<xsl:apply-templates select="report:MetaData/report:Message"/>
			</table>
		</div>  -->
		
		 
		
		<!-- validation context -->
		 <!--  <xsl:if test="report:MetaData/report:Context">
			<div id="mvrContextBox" style="display:block;">
				<br/>
				<table width="100%" cellpadding="2" cellspacing="1" border="0" class="forumline">
					<tr>
						<th class="headerReport">Assertion Type</th>
						<th class="headerReport">Assertion Result</th>
					</tr>
					<xsl:for-each select="report:MetaData/report:Context/context:FailureInterpretation">
						<xsl:apply-templates select="context:MessageFailure"/>
					</xsl:for-each>
				</table>
			</div>
		</xsl:if>-->
		<!-- Result index-->
		<div id="mvrSummary" style="display:block;">
			<br/>
			<table width="100%" cellpadding="2" cellspacing="1" border="0" class="forumline">
				<tr>
					<th colspan="3">Summary</th>
				</tr>
				<xsl:call-template name="Summary"/>
				<!--				<xsl:apply-templates select="report:Result"/>
				<xsl:apply-templates select="report:Result" mode="other"/> -->
			</table>
		</div>
		
		<div id="mvrMessageContentBox" style="display:{$msgContentDisplay};">
			<br/>
			<table width="100%" cellpadding="2" cellspacing="1" border="0" class="forumline">
			<tr>
				<th class="headerReport">Message Content</th>
			</tr>  
			<tr>
			<td class="row4">
			<div style="text-align: left">
<!-- 			<textarea rows="30" cols="100" readonly="true" wrap="off">
					<xsl:value-of select="../report:HeaderReport/message:TestObject"/>
            </textarea> -->
            <div style="width:90%;font-size:80%;">
							<xsl:for-each
								select="tokenize(../report:HeaderReport/message:TestObject,'\n')">
								<p>
									<xsl:call-template name="lineBreaker">
										<xsl:with-param name="segment">
											<xsl:value-of select="." />
										</xsl:with-param>
									</xsl:call-template>
								</p>
							</xsl:for-each>
						</div>
            </div>
			</td>	
			</tr>
			</table>
		</div>
		
		
		<div id="mvrErrors" style="display:{$mvrErrorsDisplay}">
			<xsl:if test="../report:HeaderReport/message:ErrorCount > 0">
				<br/>
				<table width="100%" cellpadding="2" cellspacing="1" border="0" class="forumline">
					<tr>
						<th colspan="3">Validation Errors</th>
					</tr>
					<tr>
						<td colspan="4" class="row5">Error Details</td>
					</tr>
					<xsl:for-each select="report:AssertionList/report:Assertion[@Result='ERROR']">
						<xsl:variable name="position">
							<xsl:value-of select="position()"/>
						</xsl:variable>
						<xsl:apply-templates select=".">
							<xsl:with-param name="position" select="$position"/>
						</xsl:apply-templates>
					</xsl:for-each>
				</table>
			</xsl:if>
		</div>
		<div id="mvrWarnings" style="display:{$mvrWarningsDisplay}">
			<xsl:if test="../report:HeaderReport/message:WarningCount > 0">
				<br/>
				<table width="100%" cellpadding="2" cellspacing="1" border="0" class="forumline">
					<tr>
						<th colspan="3">Validation Warning</th>
					</tr>
					<tr>
						<td colspan="4" class="row5">Warning Details</td>
					</tr>
					<xsl:for-each select="report:AssertionList/report:Assertion[@Result='WARNING']">
						<xsl:variable name="position">
							<xsl:value-of select="position()"/>
						</xsl:variable>
						<xsl:apply-templates select=".">
							<xsl:with-param name="position" select="$position"/>
						</xsl:apply-templates>
					</xsl:for-each>
				</table>
			</xsl:if>
		</div>
		<div id="mvrAffirmatives" style="display:{$mvrAffirmativesDisplay}">
			<xsl:if test="../report:HeaderReport/message:AffirmCount > 0">
				<br/>
				<table width="100%" cellpadding="2" cellspacing="1" border="0" class="forumline">
					<tr>
						<th colspan="3">Validation Affirmative</th>
					</tr>
					<tr>
						<td colspan="4" class="row5">Affirmative Details</td>
					</tr>
					<xsl:for-each select="report:AssertionList/report:Assertion[@Result='AFFIRMATIVE']">
						<xsl:variable name="position">
							<xsl:value-of select="position()"/>
						</xsl:variable>
						<xsl:apply-templates select=".">
							<xsl:with-param name="position" select="$position"/>
						</xsl:apply-templates>
					</xsl:for-each>
				</table>
			</xsl:if>
		</div>
		
		<div id="mvrIgnored" style="display:{$mvrIgnoredDisplay}">
			<xsl:if test="../report:HeaderReport/message:IgnoreCount > 0">
				<br/>
				<table width="100%" cellpadding="2" cellspacing="1" border="0" class="forumline">
					<tr>
						<th colspan="3">Validation Ignore</th>
					</tr>
					<tr>
						<td colspan="4" class="row5">Ignore Details</td>
					</tr>
					<xsl:for-each select="report:AssertionList/report:Assertion[@Result='IGNORE']">
						<xsl:variable name="position">
							<xsl:value-of select="position()"/>
						</xsl:variable>
						<xsl:apply-templates select=".">
							<xsl:with-param name="position" select="$position"/>
						</xsl:apply-templates>
					</xsl:for-each>
				</table>
			</xsl:if>
		</div>
		<div id="mvrAlerts" style="display:{$mvrAlertsDisplay}">
			<xsl:if test="../report:HeaderReport/message:AlertCount > 0">
				<br/>
				<table width="100%" cellpadding="2" cellspacing="1" border="0" class="forumline">
					<tr>
						<th colspan="3">Validation Alert</th>
					</tr>
					<tr>
						<td colspan="4" class="row5">Alert Details</td>
					</tr>
					<xsl:for-each select="report:AssertionList/report:Assertion[@Result='ALERT']">
						<xsl:variable name="position">
							<xsl:value-of select="position()"/>
						</xsl:variable>
						<xsl:apply-templates select=".">
							<xsl:with-param name="position" select="$position"/>
						</xsl:apply-templates>
					</xsl:for-each>
				</table>
			</xsl:if>
		</div>
	</xsl:template>
	<xsl:template match="report:MetaData/report:Profile">
		<tr>
			<td class="row1" rowspan="6" valign="top">Profile</td>
			<td class="row2">Name</td>
			<td class="row3">
				<xsl:value-of select="@Name"/>
			</td>
		</tr>
		<tr>
			<td class="row2">Organization</td>
			<td class="row3">
				<xsl:value-of select="@Organization"/>
			</td>
		</tr>
		<tr>
			<td class="row2">Type</td>
			<td class="row3">
				<xsl:value-of select="@Type"/>
			</td>
		</tr>
		<tr>
			<td class="row2">Profile Version</td>
			<td class="row3">
				<xsl:value-of select="@Version"/>
			</td>
		</tr>
		<tr>
			<td class="row2">HL7 Version</td>
			<td class="row3">
				<xsl:value-of select="@HL7Version"/>
			</td>
		</tr>
		<tr>
			<td class="row2">File</td>
			<td class="row3">
				<xsl:value-of select="../../../report:HeaderReport/message:ValidationObjectReferenceList/message:ValidationObjectReference[@Type='Profile']"/>
			</td>
		</tr>
	</xsl:template> 
	
	
	
	
	<xsl:template match="report:MetaData/report:Message">
		<tr>
			<td class="row1" rowspan="4" valign="top">
				Message Header
				<br/>
			</td>
			<td class="row2">Encoding</td>
			<td class="row3">
				<xsl:value-of select="@Encoding"/>
			</td>
		</tr>
		<tr>
			<td class="row2">Id</td>
			<td class="row3">
				<xsl:value-of select="@Id"/>
			</td>
		</tr>
		<tr>
			<td class="row2">File</td>
			<td class="row3">
				<xsl:value-of select="@Filename"/>
			</td>
		</tr> 
	</xsl:template> 
	
 
	<xsl:template match="context:MessageFailure">
		<tr>
			<td class="row2">
				<xsl:value-of select="@Type"/>
			</td>
			<td class="row1">
				<xsl:value-of select="@Result"/>
			</td>
		</tr>
	</xsl:template>
	<!--	<xsl:template match="report:Result">
		<tr>
			<td rowspan="3" class="row1">Message Validation Results</td>
			<td class="row2">Errors</td>
			<td class="row3">
				<xsl:value-of select="@ErrorCount"/>
			</td>
		</tr>
		<tr>
			<td class="row2">Warnings</td> 
			<td class="row3">
				<xsl:apply-templates select="@WarningCount"/>
			</td>
		</tr>
		<tr>
			<td class="row2">Ignored</td>
			<td class="row3">
				<xsl:value-of select="@IgnoreCount"/>
			</td>
		</tr>
	</xsl:template>
	<xsl:template match="report:Result" mode="other">
		<tr>
			<td rowspan="3" class="row1">
				Other Warnings
				<br/>
				(User Input)
			</td>
			<td class="row2">Alerts</td>
			<td class="row3">
				<xsl:value-of select="count(report:User[@FailureType = 'TABLE_NOT_FOUND'])"/>
			</td>
		</tr>
		<tr>
			<td class="row2">Location Not Found</td>
			<td class="row3">
				<xsl:value-of select="count(report:User[@FailureType = 'MESSAGE_VALIDATION_CONTEXT'])"/>
			</td>
		</tr>
	</xsl:template> -->
<!--	<xsl:template match="report:Result/report:*">
		<xsl:variable name="row">row<xsl:if test="not($position mod 2)">4</xsl:if>
			<xsl:if test="$position mod 2">3</xsl:if>
		</xsl:variable>
		<xsl:variable name="locationElement">
			<xsl:value-of select="count(Location/ProfileElement/descendant::SegmentGroup) + count(Location/ProfileElement/descendant::Segment) + count(Location/ProfileElement/descendant::Field) + count(Location/ProfileElement/descendant::Component) + count(Location/ProfileElement/descendant::SubComponent) + count(Location/Path)"/>
		</xsl:variable>
		<xsl:variable name="elementContent">
			<xsl:value-of select="count(ElementContent)"/>
		</xsl:variable>
		<xsl:variable name="commentCount">
			<xsl:value-of select="count(Comment)"/>
		</xsl:variable>
		<xsl:variable name="positionRowspan">
			<xsl:value-of select="2 + $locationElement + $elementContent + $commentCount"/>
		</xsl:variable>
		<xsl:variable name="locationRowspan">
			<xsl:value-of select="$locationElement"/>
		</xsl:variable>
		<tr>
			<td class="{$row}" rowspan="{$positionRowspan}" style="width:10px;">
				<xsl:value-of select="$position"/>
			</td>
			<td class="{$row}">Type:</td>
			<td class="{$row}" colspan="2">
				<xsl:call-template name="BeautifyAssertionType">
					<xsl:with-param name="type" select="@FailureType"/>
				</xsl:call-template>
			</td>
		</tr>
		<tr>
			<td class="{$row}">Description:</td>
			<td class="{$row}" colspan="2">
				<xsl:value-of select="Description"/>
				<xsl:if test="@FailureSeverity = 'FATAL'">
					<span style="color:red;font-weight:bold"> This is a severe failure and validation has been
						terminated.</span>
				</xsl:if>
			</td>
		</tr>
		<xsl:if test="$locationElement > 0">
			<tr class="{$row}">
				<td style="width:100px;" rowspan="{$locationRowspan}">
					<a class="jslink" onclick="showError({$position-1})" title="Show the current error">
						Location:</a>
				</td>
				<xsl:if test="Location/Path">
					<td style="font-weight: bold">Path:</td>
					<td>
						<xsl:value-of select="Location/Path"/>
					</td>
				</xsl:if>
			</tr>
			<xsl:apply-templates select="Location/ProfileElement">
				<xsl:with-param name="row" select="$row"/>
			</xsl:apply-templates>
		</xsl:if>
		<xsl:if test="ElementContent">
			<tr>
				<td class="{$row}">ElementContent:</td>
				<td class="{$row}" colspan="2">
					<xsl:value-of select="ElementContent"/>
				</td>
			</tr>
		</xsl:if>
		<xsl:if test="Comment">
			<tr>
				<td class="{$row}">Comment:</td>
				<td class="{$row}" colspan="2">
					<xsl:value-of select="Comment"/>
				</td>
			</tr>
		</xsl:if>
	</xsl:template> -->
	<xsl:template match="report:Location/report:ProfileElement">
		<xsl:param name="row"/>
		<xsl:for-each select="descendant::profile:SegmentGroup">
			<tr class="{$row}">
				<td style="font-weight: bold">Segment Group:</td>
				<td>
					<xsl:value-of select="@Name"/>
				</td>
			</tr>
		</xsl:for-each>
		<xsl:if test=".//profile:Segment">
			<tr class="{$row}">
				<td style="font-weight: bold">Segment:</td>
				<td>
					<xsl:value-of select="descendant::profile:Segment/@Name"/>
				</td>
			</tr>
			<xsl:if test="descendant::profile:Field">
				<tr class="{$row}">
					<td style="font-weight: bold">Field:</td>
					<td>
						<xsl:value-of select="descendant::profile:Field/@Name"/>
					</td>
				</tr>
				<xsl:if test="descendant::profile:Component">
					<tr class="{$row}">
						<td style="font-weight: bold">Component:</td>
						<td>
							<xsl:value-of select="descendant::profile:Component/@Name"/>
						</td>
					</tr>
					<xsl:if test="descendant::profile:SubComponent">
						<tr class="{$row}">
							<td style="font-weight: bold">SubComponent:</td>
							<td>
								<xsl:value-of select="descendant::profile:SubComponent/@Name"/>
							</td>
						</tr>
					</xsl:if>
				</xsl:if>
			</xsl:if>
		</xsl:if>
	</xsl:template>
	<xsl:template name="BeautifyAssertionType">
		<xsl:param name="type"/>
		<xsl:choose>
			<xsl:when test="$type ='MESSAGE_STRUCTURE_ID'">
				Message Structure Id
			</xsl:when>
			<xsl:when test="$type ='USAGE'">
				Usage
			</xsl:when>
			<xsl:when test="$type ='LENGTH'">
				Length
			</xsl:when>
			<xsl:when test="$type ='MESSAGE_VALIDATION_CONTEXT'">
				Message Validation Context
			</xsl:when>
			<xsl:when test="$type ='DATA'">
				Data
			</xsl:when>
			<xsl:when test="$type ='TABLE_NOT_FOUND'">
				Table Not Found
			</xsl:when>
			<xsl:when test="$type ='CARDINALITY'">
				Cardinality
			</xsl:when>
			<xsl:when test="$type ='MESSAGE_STRUCTURE'">
				Message Structure
			</xsl:when>
			<xsl:when test="$type ='AMBIGUOUS_PROFILE'">
				Ambiguous Profile
			</xsl:when>
			<xsl:when test="$type ='DATATYPE'">
				Datatype
			</xsl:when>
			<xsl:when test="$type ='VERSION'">
				Version
			</xsl:when>
			<xsl:when test="$type ='CHECKED'">
				Checked
			</xsl:when>
			<xsl:when test="$type ='DATA_PASSED'">
				Data Passed
			</xsl:when>
			<xsl:when test="$type ='SOAP'">
				SOAP Wrapper
			</xsl:when>
			<xsl:when test="$type ='WSA'">
				WSA Addressing
			</xsl:when>
			<xsl:when test="$type ='HTTP'">
				HTTP Header
			</xsl:when>
			<xsl:otherwise>
				Unknow Assertion Type
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="dateTransformer">
		<xsl:param name="myDate"/>
		<xsl:param name="myTime"/>
		<xsl:variable name="year" select="substring-before($myDate, '-')"/>
		<xsl:variable name="month" select="substring-before(substring-after($myDate, '-'), '-')"/>
		<xsl:variable name="day" select="substring-before(substring-after(substring-after($myDate, '-'), '-'), '-')"/>
<!--		<xsl:variable name="time" select="substring(substring-after($myDate, 'T'),1, 5)"/> -->
		
		<xsl:value-of select="$month"/>
		<xsl:text> </xsl:text>
		<xsl:value-of select="$day"/>
		<xsl:text> </xsl:text>
		<!-- <xsl:value-of select="document('')//map:month[@id = $month]"/> --> 
		<xsl:text> </xsl:text>
		<xsl:value-of select="$year"/>
		<xsl:text>, </xsl:text>
		<xsl:value-of select="$myTime"/>
	</xsl:template> 
	
	<xsl:param name="file_sep">
 	     <xsl:value-of select="system-property('file.separator')"/>
	</xsl:param>	
	<xsl:template name="FileName">
		<xsl:param name="path"/>
		<xsl:choose>
			<xsl:when test="contains($path, $file_sep )">
				<xsl:call-template name="FileName">
					<xsl:with-param name="path" select="substring-after($path, $file_sep)" />
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
						<xsl:value-of select="$path" />
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<map:dates>
		<map:month id="1">Jan</map:month>
		<map:month id="2">Feb</map:month>
		<map:month id="3">Mar</map:month>
		<map:month id="4">Apr</map:month>
		<map:month id="5">May</map:month>
		<map:month id="6">Jun</map:month>
		<map:month id="7">Jul</map:month>
		<map:month id="8">Aug</map:month>
		<map:month id="9">Sep</map:month>
		<map:month id="01">Jan</map:month>
		<map:month id="02">Feb</map:month>
		<map:month id="03">Mar</map:month>
		<map:month id="04">Apr</map:month>
		<map:month id="05">May</map:month>
		<map:month id="06">Jun</map:month>
		<map:month id="07">Jul</map:month>
		<map:month id="08">Aug</map:month>
		<map:month id="09">Sep</map:month>
		<map:month id="10">Oct</map:month>
		<map:month id="11">Nov</map:month>
		<map:month id="12">Dec</map:month>
	</map:dates>
	<xsl:template name="Summary">
		<!-- We are in report:SpecificReport -->
		<tr>
			<td class="row1">Errors</td>
			<td class="row2">
				<xsl:value-of select="../report:HeaderReport/message:ErrorCount"/>
			</td>
		</tr>
		<tr>
			<td class="row1">Affirmatives</td>
			<td class="row2">
				<xsl:value-of select="../report:HeaderReport/message:AffirmCount"/>
			</td>
		</tr>
		<tr>
			<td class="row1">Warnings</td>
			<td class="row2">
				<xsl:value-of select="../report:HeaderReport/message:WarningCount"/>
			</td>
		</tr>
		<tr>
			<td class="row1">Ignored</td>
			<td class="row2">
				<xsl:value-of select="../report:HeaderReport/message:IgnoreCount"/>
			</td>
		</tr>
		<tr>
			<td class="row1">Alerts</td>
			<td class="row2">
				<xsl:value-of select="../report:HeaderReport/message:AlertCount"/>
			</td>
		</tr>
	</xsl:template>
	<xsl:template match="report:Assertion">
		<xsl:param name="position"/>
		<xsl:variable name="row">row<xsl:if test="not($position mod 2)">4</xsl:if>
			<xsl:if test="$position mod 2">3</xsl:if>
		</xsl:variable>
		<xsl:variable name="locationElement">
			<xsl:value-of select="count(report:Location/report:ProfileElement/descendant::profile:SegmentGroup) + count(report:Location/report:ProfileElement/descendant::profile:Segment) + count(report:Location/report:ProfileElement/descendant::profile:Field) + count(report:Location/report:ProfileElement/descendant::profile:Component) + count(report:Location/report:ProfileElement/descendant::profile:SubComponent) + 
			count(report:Location/report:Path) + 
			count(report:Location/report:Line) +
			 count(report:Location/report:Column) "/>
		</xsl:variable>
		<xsl:variable name="contentCount">
			<xsl:value-of select="count(report:Content)"/>
		</xsl:variable>
		<xsl:variable name="assertionDeclarationCount">
			<xsl:value-of select="count(report:AssertionDeclaration)"/>
		</xsl:variable>
		<xsl:variable name="positionRowspan">
			<xsl:value-of select="2 + $locationElement + $contentCount + $assertionDeclarationCount"/>
		</xsl:variable>
		<xsl:variable name="locationRowspan">
			<xsl:value-of select="$locationElement"/>
		</xsl:variable>
		<tr>
			<td class="{$row}" rowspan="{$positionRowspan}" style="width:10px;">
				<xsl:value-of select="$position"/>
			</td>
			<td class="{$row}">Type:</td>
			<td class="{$row}" colspan="2">
				<xsl:call-template name="BeautifyAssertionType">
					<xsl:with-param name="type" select="@Type"/>
				</xsl:call-template>
			</td>
		</tr>
		<tr>
			<td class="{$row}">Description:</td>
			<td class="{$row}" colspan="2">
				<xsl:value-of select="report:Description"/>
				<xsl:if test="@Severity = 'FATAL'">
					<span style="color:red;font-weight:bold"> This is a severe failure and validation has been
						terminated.</span>
				</xsl:if>
			</td>
		</tr>
		<xsl:if test="$locationElement > 0">
			<tr class="{$row}">
				<td style="width:100px;" rowspan="{$locationRowspan}">
					Location:
				</td>
				<xsl:variable name="hasLine"><xsl:value-of select="count(report:Location/report:Line)"/></xsl:variable>
				<xsl:if test="report:Location/report:Line">
					<td style="font-weight: bold">Line:</td>
					<td>
						<xsl:value-of select="report:Location/report:Line"/>
					</td>
				</xsl:if>
				<xsl:variable name="hasColumn"><xsl:value-of select="count(report:Location/report:Column)"/></xsl:variable>
				<xsl:choose>
					<xsl:when test="$hasLine = 0">
						<xsl:if test="report:Location/report:Column">
							<td style="font-weight: bold">Column:</td>
							<td>
								<xsl:value-of select="report:Location/report:Column"/>
							</td>
						</xsl:if>
					</xsl:when>
					<xsl:otherwise>
						<xsl:if test="report:Location/report:Column">
							<tr class="{$row}">
								<td style="font-weight: bold">Column:</td>
								<td>
									<xsl:value-of select="report:Location/report:Column"/>
								</td>
							</tr>
						</xsl:if>
					</xsl:otherwise>
				</xsl:choose>
				<xsl:variable name="hasPath"><xsl:value-of select="count(report:Location/report:Path)"/></xsl:variable>
				<xsl:choose>
					<xsl:when test="$hasLine + $hasColumn = 0">
						<xsl:if test="report:Location/report:Path">
						<td style="font-weight: bold">Path:</td>
						<td>
							<xsl:value-of select="report:Location/report:Path"/>
						</td>
						</xsl:if>
					</xsl:when>
					<xsl:otherwise>
						<xsl:if test="report:Location/report:Path">
							<tr class="{$row}">
								<td style="font-weight: bold">Path:</td>
								<td>
									<xsl:value-of select="report:Location/report:Path"/>
								</td>
							</tr>
						</xsl:if>
					</xsl:otherwise>
				</xsl:choose>
			</tr>
			<xsl:apply-templates select="report:Location/report:ProfileElement">
				<xsl:with-param name="row" select="$row"/>
			</xsl:apply-templates>
		</xsl:if>
		<xsl:if test="$contentCount > 0">
			<tr>
				<td class="{$row}">ElementContent:</td>
				<td class="{$row}" colspan="2">
					<xsl:value-of select="report:Content"/>
				</td>
			</tr>
		</xsl:if>
		<xsl:if test="$assertionDeclarationCount > 0">
			<tr>
				<td class="{$row}">Assertion Declaration:</td>
				<td class="{$row}" colspan="2">
					<xsl:value-of select="report:AssertionDeclaration"/>
				</td>
			</tr>
		</xsl:if>
	</xsl:template> 
	
	<xsl:template name="lineBreaker">
		<xsl:param name="segment" />
		<xsl:if test="string-length($segment) > 0">
			<xsl:value-of select="substring($segment,1,110)" />
			<br />
			<xsl:variable name="segment">
				<xsl:value-of select="substring($segment,111)" />
			</xsl:variable>
			<xsl:call-template name="lineBreaker">
				<xsl:with-param name="segment" select="$segment" />
			</xsl:call-template>
		</xsl:if>
	</xsl:template>
	
</xsl:stylesheet>
