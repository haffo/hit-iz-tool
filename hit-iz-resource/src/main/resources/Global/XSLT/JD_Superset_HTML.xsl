<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:util="http://hl7.nist.gov/juoro-doc/util" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" exclude-result-prefixes="xs util">
    <xsl:output method="xhtml" encoding="UTF-8" indent="yes"/>
    <xsl:template name="commentTemplate">

        <td bgcolor="#F2F2F2">
            <!--   <div  contentEditable="true" style="width: 100%; height: 100%; border: none; resize: none; max-width: 300px;">
                <xsl:text disable-output-escaping="yes">&amp;</xsl:text>nbsp;</div>-->
            <textarea maxLength="100" rows="1"
                style="width: 100%; height: 100%; border: 1px; background: 1px  #EDEDED; resize:vertical; "> </textarea>

        </td>

    </xsl:template>
    <xsl:template name="testExistence">
        <xsl:param name="node"/>
        <xsl:choose>
            <xsl:when test="exists($node)">
                <td>
                    <xsl:value-of select="$node"/>
                </td>
            </xsl:when>
            <xsl:otherwise>
                <td bgcolor="#D2D2D2"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template name="testExistence-with-date">
        <xsl:param name="node"/>
        <xsl:choose>
            <xsl:when test="exists($node)">
                <xsl:choose>
                    <xsl:when test="$node != ''">
                        <td>
                            <xsl:value-of select="util:format-date($node)"/>

                        </td>
                    </xsl:when>
                    <xsl:otherwise>
                        <td bgcolor="#D2D2D2"/>
                    </xsl:otherwise>
                </xsl:choose>

            </xsl:when>
            <xsl:otherwise>
                <td bgcolor="#D2D2D2"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template name="followSibling-with-date">
        <xsl:param name="node2"/>
        <xsl:choose>
            <xsl:when test="$node2 != ''">
                <td>
                    <xsl:value-of select="util:format-date($node2)"/>

                </td>
            </xsl:when>
            <xsl:otherwise>
                <td bgcolor="#D2D2D2"/>
            </xsl:otherwise>
        </xsl:choose>

    </xsl:template>
    <!-- <xsl:template name="dateTime">
        <xsl:param name="dateS"/>
        <xsl:variable name="dateformat"
            select="
                xs:date(concat(
                substring($dateS, 1, 4), '-',
                substring($dateS, 5, 2), '-',
                substring($dateS, 7, 2)
                ))"/>
        <xsl:value-of select="format-date($dateformat, '[M01]/[D01]/[Y0001]')"/> 
    </xsl:template>-->
    <xsl:function name="util:format-date">
        <xsl:param name="elementDataIn"/>
        <xsl:variable name="elementData" select="concat($elementDataIn, '                ')"/>
        <xsl:if test="string-length(normalize-space($elementData)) > 0">
            <xsl:variable name="year" select="substring($elementData, 1, 4)"/>
            <xsl:variable name="month" select="concat(substring($elementData, 5, 2), '/')"/>
            <xsl:variable name="day" select="concat(substring($elementData, 7, 2), '/')"/>
            <xsl:value-of select="concat($month, $day, $year)"/>

        </xsl:if>
    </xsl:function>
    <xsl:function name="util:followSiblingDate">
        <xsl:param name="followSibling"/>
        <xsl:param name="position"/>
        <xsl:variable name="value">
            <xsl:choose>
                <xsl:when
                    test="$followSibling[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                    
                    <xsl:for-each
                        select="$followSibling[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                        
                        <xsl:if test="position() = 1">
                            <xsl:call-template name="followSibling-with-date">
                                <xsl:with-param name="node2" select="OBX/OBX.5/OBX.5.1"/>
                            </xsl:call-template>
                        </xsl:if>
                    </xsl:for-each>
                </xsl:when>
                <xsl:otherwise>
                    <td bgcolor="#D2D2D2"/>
                </xsl:otherwise>
            </xsl:choose>
            
        </xsl:variable>
        <xsl:copy-of select="$value"/>
    </xsl:function>
    <xsl:function name="util:followSibling">
        <xsl:param name="followSibling"/>
        <xsl:param name="position"/>
        <xsl:variable name="value">
            <xsl:choose>
                <xsl:when
                    test="$followSibling[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                    
                    <xsl:for-each
                        select="$followSibling[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                        
                        <xsl:if test="position() = 1">
                            <td>
                                <xsl:value-of select="OBX/OBX.5/OBX.5.2"/>
                            </td>
                            
                        </xsl:if>
                    </xsl:for-each>
                </xsl:when>
                <xsl:otherwise>
                    <td bgcolor="#D2D2D2"/>
                </xsl:otherwise>
            </xsl:choose>
            
        </xsl:variable>
        <xsl:copy-of select="$value"/>
    </xsl:function>
    <xsl:template match="/">
        <form>
            <html>
                <head>

                    <style type="text/css">
                        @media screen{
                            .jurordocument fieldset{
                                font-size:100%;
                            }
                            .jurordocument table tbody tr th{
                                font-size:90%;
                            }
                            .jurordocument table tbody tr td{
                                font-size:90%;
                            }
                        }
                        @media print{
                            .jurordocument fieldset{
                                font-size:x-small;
                            }
                            .jurordocument table{
                                page-break-inside:avoid;
                            }
                            .jurordocument table th{
                                font-size:x-small;
                            }
                        
                            .jurordocument table td{
                                font-size:xx-small;
                            }
                            * [type = text]{
                                width:98%;
                                height:15px;
                                margin:2px;
                                padding:0px;
                                background:1px #ccc;
                        
                            }
                            .jurordocument h3{
                                font-size:xx-small;
                            }
                            .jurordocument p{
                                font-size:x-small;
                            }
                        
                        
                            .jurordocument * [type = checkbox]{
                                width:10px;
                                height:10px;
                                margin:2px;
                                padding:0px;
                                background:1px #ccc;
                            }
                        }
                        
                        .jurordocument * [type = text]{
                            width:95%;
                        
                        }
                        
                        .jurordocument fieldset{
                            width:98%;
                            border:1px solid #446BEC;
                            page-break-inside:avoid;
                        }
                        .embSpace{
                            padding-left:25px;
                        }
                        .noData{
                            background:#D2D2D2;
                        }
                        .jurordocument table{
                            width:98%;
                            border:1px groove;
                            margin:0 auto;
                            page-break-inside:avoid;
                        }
                        .jurordocument table tr{
                            border:1px groove;
                        }
                        .jurordocument table th{
                            border:1px groove;
                        }
                        .jurordocument table td{
                            border:1px groove;
                            empty-cells:show;
                        }
                        .jurordocument table thead{
                            border:1px groove;
                            background:#446BEC;
                            text-align:center;
                            color:white;
                        }
                        .jurordocument table[id = inspectionStatus] thead tr th:last-child{
                            width:2%;
                            color:black;
                        }
                        .jurordocument table[id = inspectionStatus] thead tr th:nth-last-child(2){
                            width:2%;
                            color:black;
                        }
                        .jurordocument table[id = inspectionStatus] thead tr th:nth-last-child(3){
                            width:45%;
                        }
                        .jurordocument table tbody tr th{
                            text-align:center;
                            background:#C6DEFF;
                        }
                        .jurordocument table tbody tr th:first-child{
                            text-align:left;
                            background:#C6DEFF;
                            width:20%;
                        }
                        .jurordocument table tbody tr[id = header] th{
                            text-align:center;
                            background:#B0C4DE;
                        }
                        .jurordocument table tbody tr td{
                            text-align:left;
                        }
                        .jurordocument table tbody tr td [type = text]{
                            text-align:left;
                            margin-left:1%;
                        }
                        
                        .jurordocument table caption{
                            font-weight:bold;
                            color:#0840F8;
                        }
                        }</style>
                    <script>
                        function comment(){
                        
                        $("textarea").on("keyup",function (){
                        var h=$(this);
                        h.height(30).height(h[0].scrollHeight);
                        });
                        
                        }
                        if(typeof jQuery =='undefined') {
                        var headTag = document.getElementsByTagName("head")[0];
                        var jqTag = document.createElement('script');
                        jqTag.type = 'text/javascript';
                        jqTag.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js';
                        jqTag.onload = comment;
                        headTag.appendChild(jqTag);
                        }
                        else {  
                        $(document).ready(function (){
                        
                        comment();
                        
                        })
                        
                        }
                    </script>

                </head>
                <body>

                    <div class="jurordocument">
                       
                            <table>
                                <thead>
                                    <tr>
                                        <th colspan="2">Evaluated Immunization History and Immunization
                                            Forecast</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th>Test Case ID</th>
                                        
                                        <td>
                                            <xsl:value-of select="RSP_K11/@testcaseName"/>
                                        </td>
                                        
                                    </tr>
                                    <tr>
                                        <th>Juror ID</th>
                                        <td>
                                            <input style="background: 1px  #E2E2E2;" type="text"
                                                maxlength="50" value=""/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Juror Name</th>
                                        <td>
                                            <input style="background: 1px  #E2E2E2;" type="text"
                                                maxlength="50" value=""/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>HIT System Tested</th>
                                        <td>
                                            <input style="background: 1px  #E2E2E2;" type="text"
                                                maxlength="50" value=""/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Inspection Date/Time</th>
                                        <td>
                                            <input style="background: 1px  #E2E2E2;" type="text"
                                                maxlength="50" value=""/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Inspection Settlement (Pass/Fail)</th>
                                        <td>
                                            <table id="inspectionStatus">
                                                <thead>
                                                    <tr>
                                                        <th>Pass</th>
                                                        <th>Fail</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    
                                                    <tr>
                                                        <td>
                                                            <input type="checkbox" value=""/>
                                                        </td>
                                                        <td>
                                                            <input type="checkbox" value=""/>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Reason Failed</th>
                                        <td>
                                            <input style="background: 1px  #E2E2E2;" type="text"
                                                maxlength="50" value=""/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Juror Comments</th>
                                        <td>
                                            <input style="background: 1px  #E2E2E2;" type="text"
                                                maxlength="50" value=""/>
                                        </td>
                                    </tr>
                                    
                                </tbody>
                            </table>

                            <h3>DISPLAY VERIFICATION</h3>


                            <fieldset>
                                <p>This Test Case-specific Juror Document provides a checklist for
                                    the Tester to use during certification testing for assessing the
                                    EHR technology's ability to display required core data elements
                                    from the information received in the Evaluated Immunization
                                    History and Immunization Forecast Z42 response message. Additional data
                                    from the message or from the EHR are permitted to be displayed
                                    by the EHR. Grayed-out fields in the Juror Document indicate
                                    where no data for the data element indicated were included in
                                    the Z42 message for the given Test Case.</p>
                                <p>The format of this Juror Document is for ease-of-use by the
                                    Tester and does not indicate how the EHR display must be
                                    designed.</p>
                                <p>The Evaluated Immunization History and Immunization Forecast data
                                    shown in this Juror Document are derived from the Z42 message
                                    provided with the given Test Case; equivalent data are permitted
                                    to be displayed by the EHR. The column headings are meant to
                                    convey the kind of data to be displayed; equivalent
                                    labels/column headings are permitted to be displayed by the
                                    EHR.</p>
                            </fieldset>
                            <br/>
                            <!-- Patient Information -->
                            <table>
                                <thead>
                                    <tr>
                                        <th colspan="3">Patient Information</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr id="header">
                                        <th width="30%">Element Name</th>
                                        <th width="30%">Data</th>
                                        <th width="40%">Tester Comment</th>
                                    </tr>
                                    <xsl:for-each select="//PID">
                                        <xsl:for-each select="PID.3">
                                            <tr>
                                                <th colspan="3">Patient Identifier</th>
                                            </tr>
                                            <tr>
                                                <th style="text-indent: 40px">ID Number</th>

                                                <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node" select="PID.3.1"/>
                                                </xsl:call-template>


                                                <xsl:call-template name="commentTemplate"/>

                                            </tr>
                                            <tr>
                                                <th style="text-indent: 40px" colspan="3">Assigning
                                                  Authority</th>
                                            </tr>
                                            <tr>
                                                <th style="text-indent: 60px">Namespace ID</th>
                                                <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node"
                                                  select="PID.3.4/PID.3.4.1"/>
                                                </xsl:call-template>


                                                <xsl:call-template name="commentTemplate"/>

                                            </tr>
                                            <tr>
                                                <th style="text-indent: 40px">ID Type</th>
                                                <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node" select="PID.3.5"/>
                                                </xsl:call-template>


                                                <xsl:call-template name="commentTemplate"/>
                                            </tr>
                                        </xsl:for-each>

                                        <tr>
                                            <th>Name</th>
                                            <xsl:choose>
                                                <xsl:when test="exists(PID.5)">
                                                  <td>

                                                  <xsl:value-of
                                                  select="concat(PID.5/PID.5.2, ' ', PID.5/PID.5.3, ' ', PID.5/PID.5.1/PID.5.1.1)"
                                                  />
                                                  </td>
                                                </xsl:when>
                                                <xsl:otherwise>
                                                  <td bgcolor="#D2D2D2"/>
                                                </xsl:otherwise>
                                            </xsl:choose>
                                            <xsl:call-template name="commentTemplate"/>
                                        </tr>
                                        <tr>
                                            <th>Date of Birth</th>
                                            <xsl:call-template name="testExistence-with-date">
                                                <xsl:with-param name="node" select="PID.7/PID.7.1"/>
                                            </xsl:call-template>
                                            <xsl:call-template name="commentTemplate"/>
                                        </tr>

                                        <tr>
                                            <th>Sex</th>

                                            <xsl:choose>
                                                <xsl:when test="exists(PID.8)">
                                                  <xsl:choose>
                                                  <xsl:when test="PID.8 = 'F'">
                                                  <td> Female </td>
                                                  </xsl:when>
                                                  <xsl:when test="PID.8 = 'M'">
                                                  <td> Male </td>
                                                  </xsl:when>
                                                  </xsl:choose>
                                                </xsl:when>
                                                <xsl:otherwise>
                                                  <td bgcolor="#D2D2D2"/>
                                                </xsl:otherwise>
                                            </xsl:choose>

                                            <xsl:call-template name="commentTemplate"/>

                                        </tr>
                                        <xsl:for-each select="PID.11">

                                            <tr>
                                                <th colspan="3">
                                                  <xsl:value-of
                                                  select="concat('Address', ' ', position())"/>
                                                </th>
                                            </tr>


                                            <tr>
                                                <th style="text-indent: 40px">Street</th>

                                                <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node"
                                                  select="PID.11.1/PID.11.1.1"/>
                                                </xsl:call-template>


                                                <xsl:call-template name="commentTemplate"/>
                                            </tr>
                                            <tr>
                                                <th style="text-indent: 40px">Other Designation</th>

                                                <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node" select="PID.11.2"/>
                                                </xsl:call-template>


                                                <xsl:call-template name="commentTemplate"/>
                                            </tr>
                                            <tr>
                                                <th style="text-indent: 40px">City</th>

                                                <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node" select="PID.11.3"/>
                                                </xsl:call-template>


                                                <xsl:call-template name="commentTemplate"/>
                                            </tr>
                                            <tr>
                                                <th style="text-indent: 40px">State</th>

                                                <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node" select="PID.11.4"/>
                                                </xsl:call-template>

                                                <xsl:call-template name="commentTemplate"/>
                                            </tr>
                                            <tr>
                                                <th style="text-indent: 40px">Zip Code</th>

                                                <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node" select="PID.11.5"/>
                                                </xsl:call-template>

                                                <xsl:call-template name="commentTemplate"/>
                                            </tr>
                                            <tr>
                                                <th style="text-indent: 40px">Country</th>

                                                <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node" select="PID.11.6"/>
                                                </xsl:call-template>

                                                <xsl:call-template name="commentTemplate"/>
                                            </tr>
                                            <tr>
                                                <th style="text-indent: 40px">Address Type</th>

                                                <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node" select="PID.11.7"/>
                                                </xsl:call-template>

                                                <xsl:call-template name="commentTemplate"/>
                                            </tr>
                                        </xsl:for-each>
                                        <tr>
                                            <th>Mother's Maiden Name</th>
                                            <xsl:choose>
                                                <xsl:when test="exists(PID.6)">

                                                  <td>
                                                  <xsl:value-of
                                                  select="concat(PID.6/PID.6.2, ' ', PID.6/PID.6.3, ' ', PID.6/PID.6.1/PID.6.1.1)"
                                                  />
                                                  </td>
                                                </xsl:when>
                                                <xsl:otherwise>
                                                  <td bgcolor="#D2D2D2"/>
                                                </xsl:otherwise>
                                            </xsl:choose>
                                            <xsl:call-template name="commentTemplate"/>
                                        </tr>
                                    </xsl:for-each>

                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="3">When displayed in the EHR with the Evaluated
                                            Immunization History and Immunization Forecast, these
                                            patient demographics data may be derived from either the
                                            received immunization message or the EHR patient record.
                                            When displaying demographics from the patient record,
                                            the EHR must be able to demonstrate a linkage between
                                            the demographics in the message (primarily the patient
                                            ID in PID-3.1) and the patient record used for display
                                            to ensure that the message was associated with the
                                            appropriate patient. </td>
                                    </tr>
                                </tfoot>
                            </table>
                            <br/>



                            <!-- Evaluation Immunization history Where RXA.5.1 != 998 go into the below table-->
                            <xsl:if
                                test="exists(//RXA.5.1[. != '998']/../../../RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7'])">

                                <table>
                                    <thead>
                                        <tr>
                                            <th colspan="3">Evaluated Immunization History
                                                Information</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <xsl:for-each select="//RXA.5.1[. != '998']/../../..">

                                            <xsl:for-each
                                                select="RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..">
                                                <xsl:variable name="position" select="position()"/>
                                                <tr id="header">
                                                  <th width="30%">Element Name</th>
                                                  <th width="30%">Data</th>
                                                  <th width="40%">Tester Comment</th>
                                                </tr>

                                                <tr>
                                                  <th>Entering Organization</th>

                                                  <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node"
                                                  select="../ORC/ORC.17/ORC.17.2"/>
                                                  </xsl:call-template>


                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th>Vaccine Group</th>
                                                  <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node"
                                                  select="OBX/OBX.5/OBX.5.2"/>
                                                  </xsl:call-template>
                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th>Vaccine Administered</th>
                                                  <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node"
                                                  select="../RXA/RXA.5/RXA.5.2"/>
                                                  </xsl:call-template>
                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th> Refusal Reason </th>

                                                  <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node"
                                                  select="../RXA/RXA.18/RXA.18.2"/>
                                                  </xsl:call-template>



                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th> Date/Time Administration-Start </th>
                                                  <xsl:call-template name="testExistence-with-date">
                                                  <xsl:with-param name="node"
                                                  select="../RXA/RXA.3/RXA.3.1"/>
                                                  </xsl:call-template>
                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th> Date/Time Administration-End </th>

                                                  <xsl:call-template name="testExistence-with-date">
                                                  <xsl:with-param name="node"
                                                  select="../RXA/RXA.4/RXA.4.1"/>
                                                  </xsl:call-template>
                                                  <xsl:call-template name="commentTemplate"/>

                                                </tr>
                                                <tr>
                                                  <th> Administered Amount </th>
                                                  <xsl:choose>
                                                  <xsl:when test="../RXA/RXA.6 != 999">
                                                  <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node" select="../RXA/RXA.6"
                                                  />
                                                  </xsl:call-template>
                                                  </xsl:when>
                                                  <xsl:otherwise>
                                                  <td bgcolor="#D2D2D2"/>
                                                  </xsl:otherwise>
                                                  </xsl:choose>

                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th>Administered Units of Measure</th>

                                                  <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node"
                                                  select="../RXA/RXA.7/RXA.7.1"/>
                                                  </xsl:call-template>

                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th>Route of Administration</th>

                                                  <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node"
                                                  select="../RXR/RXR.1/RXR.1.2"/>
                                                  </xsl:call-template>


                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th>Administration Site</th>

                                                  <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node"
                                                  select="../RXR/RXR.2/RXR.2.2"/>
                                                  </xsl:call-template>


                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>

                                                <tr>
                                                  <th> Substance Manufacturer Name </th>

                                                  <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node"
                                                  select="../RXA/RXA.17/RXA.17.2"/>
                                                  </xsl:call-template>


                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th> Administration Notes </th>

                                                  <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node"
                                                  select="../RXA/RXA.9/RXA.9.2"/>
                                                  </xsl:call-template>


                                                  <xsl:call-template name="commentTemplate"/>

                                                </tr>
                                                <tr>
                                                  <th colspan="3">Administering Provider </th>
                                                </tr>
                                                <tr>
                                                  <th style="text-indent: 40px">Name</th>
                                                  <xsl:choose>
                                                  <xsl:when test="exists(../RXA/RXA.10)">

                                                  <td>
                                                  <xsl:value-of
                                                  select="concat(../RXA/RXA.10/RXA.10.3, ' ', ../RXA/RXA.10/RXA.10.4, ' ', ../RXA/RXA.10/RXA.10.2/RXA.10.2.1)"
                                                  />
                                                  </td>
                                                  </xsl:when>
                                                  <xsl:otherwise>
                                                  <td bgcolor="#D2D2D2"/>
                                                  </xsl:otherwise>
                                                  </xsl:choose>


                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th style="text-indent: 40px">ID Number</th>

                                                  <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node"
                                                  select="../RXA/RXA.10/RXA.10.1"/>
                                                  </xsl:call-template>


                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th colspan="3">Administered-at Location</th>
                                                </tr>
                                                <tr>
                                                  <th style="text-indent: 40px"> Facility ID </th>

                                                  <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node"
                                                  select="../RXA/RXA.11/RXA.11.4/RXA.11.4.1"/>
                                                  </xsl:call-template>


                                                  <xsl:call-template name="commentTemplate"/>

                                                </tr>

                                                <tr>
                                                  <th style="text-indent: 40px">Street Address</th>

                                                  <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node"
                                                  select="../RXA/RXA.11/RXA.11.9"/>
                                                  </xsl:call-template>


                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th style="text-indent: 40px">Other
                                                  Designation</th>

                                                  <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node"
                                                  select="../RXA/RXA.11/RXA.11.10"/>
                                                  </xsl:call-template>


                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th style="text-indent: 40px">City</th>
                                                  <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node"
                                                  select="../RXA/RXA.11/RXA.11.11"/>
                                                  </xsl:call-template>

                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th style="text-indent: 40px">State</th>

                                                  <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node"
                                                  select="../RXA/RXA.11/RXA.11.12"/>
                                                  </xsl:call-template>

                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th style="text-indent: 40px">Zip Code</th>

                                                  <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node"
                                                  select="../RXA/RXA.11/RXA.11.13"/>
                                                  </xsl:call-template>


                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th style="text-indent: 40px">Country</th>

                                                  <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node"
                                                  select="../RXA/RXA.11/RXA.11.14"/>
                                                  </xsl:call-template>


                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>

                                                <tr>
                                                  <th>Valid Dose</th>
                                                  <xsl:choose>
                                                  <xsl:when
                                                      test="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59781-5']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                                  <xsl:for-each
                                                      select="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59781-5']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                                  <xsl:if test="position() = 1">
                                                  <xsl:choose>
                                                  <xsl:when test="OBX/OBX.5/OBX.5.1 = 'Y'">
                                                  <td>YES</td>
                                                  </xsl:when>
                                                  <xsl:when test="OBX/OBX.5/OBX.5.1 = 'N'">
                                                  <td>NO</td>
                                                  </xsl:when>
                                                  </xsl:choose>
                                                  </xsl:if>
                                                  </xsl:for-each>
                                                  </xsl:when>
                                                  <xsl:otherwise>
                                                  <td bgcolor="#D2D2D2"/>
                                                  </xsl:otherwise>
                                                  </xsl:choose>
                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th>Validity Reason</th>
                                                  
                                                    <xsl:copy-of
                                                        select="util:followSibling(following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30982-3']/../../.., $position)"/>
                                                    
                                                  <xsl:call-template name="commentTemplate"/>

                                                </tr>
                                                <tr>
                                                  <th>Completion Status*</th>
                                                  <xsl:choose>
                                                  <xsl:when test="exists(../RXA/RXA.20)">
                                                  <xsl:choose>
                                                  <xsl:when test="../RXA/RXA.20 = 'CP'">
                                                  <td> Complete </td>
                                                  </xsl:when>
                                                  <xsl:when test="../RXA/RXA.20 = 'NA'">
                                                  <td> Not Administered </td>
                                                  </xsl:when>
                                                  <xsl:when test="../RXA/RXA.20 = 'PA'">
                                                  <td> Partially Administered </td>
                                                  </xsl:when>
                                                  <xsl:when test="../RXA/RXA.20 = 'RE'">
                                                  <td> Refused </td>
                                                  </xsl:when>
                                                  </xsl:choose>
                                                  </xsl:when>
                                                  <xsl:otherwise>
                                                  <td bgcolor="#D2D2D2"/>
                                                  </xsl:otherwise>
                                                  </xsl:choose>
                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>

                                                <tr>
                                                  <th>Dose Number in Series</th>
                                                  <xsl:choose>
                                                  <xsl:when
                                                      test="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30973-2']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                                  <xsl:for-each
                                                      select="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30973-2']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                                  <xsl:if test="position() = 1">

                                                  <td>
                                                  <xsl:value-of select="OBX/OBX.5/OBX.5.1"/>
                                                  </td>

                                                  </xsl:if>
                                                  </xsl:for-each>
                                                  </xsl:when>
                                                  <xsl:otherwise>
                                                  <td bgcolor="#D2D2D2"/>
                                                  </xsl:otherwise>
                                                  </xsl:choose>
                                                  <xsl:call-template name="commentTemplate"/>

                                                </tr>
                                                <tr>
                                                  <th>Number of Doses in Series</th>
                                                  <xsl:choose>
                                                  <xsl:when
                                                      test="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59782-3']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                                  <xsl:for-each
                                                      select="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59782-3']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                                  <xsl:if test="position() = 1">

                                                  <td>
                                                  <xsl:value-of select="OBX/OBX.5/OBX.5.1"/>
                                                  </td>

                                                  </xsl:if>
                                                  </xsl:for-each>
                                                  </xsl:when>
                                                  <xsl:otherwise>
                                                  <td bgcolor="#D2D2D2"/>
                                                  </xsl:otherwise>
                                                  </xsl:choose>
                                                  <xsl:call-template name="commentTemplate"/>

                                                </tr>
                                                <tr>
                                                  <th>Immunization Series Name</th>
                                                    <xsl:copy-of
                                                        select="util:followSibling(following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59780-7']/../../.., $position)"/>
                                                 
                                                  <xsl:call-template name="commentTemplate"/>

                                                </tr>
                                                <tr>
                                                  <th>Status in Immunization Series</th>
                                                    <xsl:copy-of
                                                        select="util:followSibling(following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59783-1']/../../.., $position)"/>
                                                  
                                                  <xsl:call-template name="commentTemplate"/>

                                                </tr>
                                                <tr>
                                                  <th>Immunization Schedule Used</th>
                                                    <xsl:copy-of
                                                        select="util:followSibling(following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59779-9']/../../.., $position)"/>
                                                  
                                                  <xsl:call-template name="commentTemplate"/>

                                                </tr>
                                                <tr>
                                                  <td colspan="3"
                                                  ><xsl:text disable-output-escaping="yes">&amp;</xsl:text>nbsp;</td>
                                                </tr>

                                            </xsl:for-each>
                                        </xsl:for-each>

                                    </tbody>

                                    <tfoot>
                                        <tr>
                                            <td colspan="3">* "Completion Status" refers to the
                                                status of the dose of vaccine administered on the
                                                indicated date and may be interpreted as "Dose
                                                Status". A status of "Complete" means that the
                                                vaccine dose was "completely administered" as
                                                opposed to "partially administered". </td>
                                        </tr>
                                    </tfoot>
                                </table>

                                <br/>
                            </xsl:if>
                            <!-- Immunization Forecast where RXA.5.1=998 go to the below table-->
                            <xsl:if
                                test="//RXA.5.1[. = '998']/../../../RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']">
                                <table>
                                    <thead>
                                        <tr>
                                            <th colspan="3">Immunization Forecast</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <xsl:for-each select="//RXA.5.1[. = '998']/../../..">

                                            <xsl:for-each
                                                select="RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..">
                                                <xsl:variable name="position" select="position()"/>
                                                <tr id="header">
                                                  <th width="30%">Element Name</th>
                                                  <th width="30%">Data</th>
                                                  <th width="40%">Tester Comment</th>
                                                </tr>


                                                <tr>
                                                  <th>Vaccine Group</th>
                                                  <xsl:call-template name="testExistence">
                                                  <xsl:with-param name="node"
                                                  select="OBX/OBX.5/OBX.5.2"/>
                                                  </xsl:call-template>
                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th>Vaccine Due Date</th>
                                                    <xsl:copy-of
                                                        select="util:followSiblingDate(following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30980-7']/../../.., $position)"/>
                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th>Earliest Date to Give</th>
                                                    <xsl:copy-of
                                                        select="util:followSiblingDate(following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30981-5']/../../.., $position)"/>
                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th>Latest Date to Give</th>
                                                    <xsl:copy-of
                                                        select="util:followSiblingDate(following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59777-3']/../../.., $position)"/>
                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th>Date When Vaccine Overdue</th>
                                                    <xsl:copy-of
                                                        select="util:followSiblingDate(following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59778-1']/../../.., $position)"/>
                                                 
                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th>Status in Immunization Series</th>
                                                    <xsl:copy-of
                                                        select="util:followSibling(following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59783-1']/../../.., $position)"/>
                                                
                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>
                                                <tr>
                                                  <th>Forecast Reason</th>
                                                    <xsl:copy-of
                                                        select="util:followSibling(following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30982-3']/../../.., $position)"/>
                                                    
                                                  <xsl:call-template name="commentTemplate"/>
                                                </tr>


                                                <tr>
                                                  <td colspan="3"
                                                  ><xsl:text disable-output-escaping="yes">&amp;</xsl:text>nbsp;</td>
                                                </tr>
                                            </xsl:for-each>
                                        </xsl:for-each>


                                    </tbody>

                                </table>
                            </xsl:if>

                    </div>
                </body>
            </html>
        </form>
    </xsl:template>
</xsl:stylesheet>
