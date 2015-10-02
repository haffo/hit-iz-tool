<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:util="http://hl7.nist.gov/juoro-doc/util"
    exclude-result-prefixes="xs util" version="2.0">
    <xsl:output method="xhtml" encoding="UTF-8" indent="yes"/>

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
       
    </xsl:template>  -->
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

    <xsl:template match="PID">

        <xsl:for-each select="PID.3">
            <element>
                <elementName>Patient Identifier</elementName>
                <Data/>
                <testerComment/>
            </element>

            <element>
                <elementName>ID Number</elementName>
                <Data>
                    <xsl:value-of select="PID.3.1"/>
                </Data>
                <testerComment>
                    <xsl:text/>
                </testerComment>
            </element>
            <element>
                <elementName>Assigning Authority</elementName>
                <Data/>
                <testerComment/>
            </element>
            <element>
                <elementName>Namespace ID</elementName>
                <Data>
                    <xsl:value-of select="PID.3.4/PID.3.4.1"/>
                </Data>
                <testerComment>
                    <xsl:text/>
                </testerComment>
            </element>
            <element>
                <elementName>ID Type</elementName>
                <Data>
                    <xsl:value-of select="PID.3.5"/>
                </Data>
                <testerComment>
                    <xsl:text/>
                </testerComment>
            </element>


        </xsl:for-each>
        <element>
            <elementName>Name</elementName>
            <Data>
                <xsl:value-of
                    select="concat(PID.5/PID.5.2, ' ', PID.5/PID.5.3, ' ', PID.5/PID.5.1/PID.5.1.1)"
                />
            </Data>
            <testerComment>
                <xsl:text/>
            </testerComment>
        </element>
        <element>
            <elementName>Date of Birth</elementName>
            <Data>
                <xsl:value-of select="util:format-date(PID.7/PID.7.1)"/>
            </Data>
            <testerComment>
                <xsl:text/>
            </testerComment>
        </element>
        <element>
            <elementName>Sex</elementName>
            <xsl:choose>
                <xsl:when test="PID.8 != ''">
                    <xsl:choose>
                        <xsl:when test="PID.8 = 'F'">
                            <Data> Female </Data>
                        </xsl:when>
                        <xsl:when test="PID.8 = 'M'">
                            <Data> Male </Data>
                        </xsl:when>
                    </xsl:choose>
                </xsl:when>
                <xsl:otherwise>
                    <Data/>
                </xsl:otherwise>
            </xsl:choose>
            <testerComment>
                <xsl:text/>
            </testerComment>
        </element>

        <xsl:for-each select="PID.11">
            <element>
                <elementName>
                    <xsl:value-of select="concat('Address', ' ', position())"/>
                </elementName>
                <Data/>
                <testerComment/>
            </element>
            <element>
                <elementName>Street</elementName>
                <Data>
                    <xsl:value-of select="PID.11.1/PID.11.1.1"/>
                </Data>
                <testerComment>
                    <xsl:text/>
                </testerComment>
            </element>
            <element>
                <elementName>Other Designation</elementName>
                <Data>
                    <xsl:value-of select="PID.11.2"/>
                </Data>
                <testerComment>
                    <xsl:text/>
                </testerComment>
            </element>
            <element>
                <elementName>City</elementName>
                <Data>
                    <xsl:value-of select="PID.11.3"/>
                </Data>
                <testerComment>
                    <xsl:text/>
                </testerComment>
            </element>
            <element>
                <elementName>State</elementName>
                <Data>
                    <xsl:value-of select="PID.11.4"/>
                </Data>
                <testerComment>
                    <xsl:text/>
                </testerComment>
            </element>
            <element>
                <elementName>Zip Code</elementName>
                <Data>
                    <xsl:value-of select="PID.11.5"/>
                </Data>
                <testerComment>
                    <xsl:text/>
                </testerComment>
            </element>
            <element>
                <elementName>Country</elementName>
                <Data>
                    <xsl:value-of select="PID.11.6"/>
                </Data>
                <testerComment>
                    <xsl:text/>
                </testerComment>
            </element>
            <element>
                <elementName>Address Type</elementName>
                <Data>
                    <xsl:value-of select="PID.11.7"/>
                </Data>
                <testerComment>
                    <xsl:text/>
                </testerComment>
            </element>


        </xsl:for-each>
        <element>
            <elementName>Mother's Maiden Name</elementName>
            <Data>
                <xsl:value-of
                    select="concat(PID.6/PID.6.2, ' ', PID.6/PID.6.3, ' ', PID.6/PID.6.1/PID.6.1.1)"
                />
            </Data>
            <testerComment>
                <xsl:text/>
            </testerComment>
        </element>
    </xsl:template>
    <xsl:template match="/">
        <jurorDocument>
            <patientInformation>

                <xsl:apply-templates select="//PID"/>

            </patientInformation>
            <xsl:for-each select="//RXA.5.1[. != '998']/../../..">

                <xsl:for-each select="RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..">
                    <xsl:variable name="position" select="position()"/>
                    <evaluatedImmunizationHistory>
                        <element>
                            <elementName>Entering Organization</elementName>
                            <Data>
                                <xsl:value-of select="../ORC/ORC.17/ORC.17.2"/>
                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Vaccine Group</elementName>
                            <Data>
                                <xsl:value-of select="OBX/OBX.5/OBX.5.2"/>
                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Vaccine Administered</elementName>
                            <Data>
                                <xsl:value-of select="../RXA/RXA.5/RXA.5.2"/>
                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Refusal Reason</elementName>
                            <Data>
                                <xsl:value-of select="../RXA/RXA.18/RXA.18.2"/>
                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName> Date/Time Administration-Start </elementName>
                            <Data>
                                <xsl:value-of select="util:format-date(../RXA/RXA.3/RXA.3.1)"/>


                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName> Date/Time Administration-End </elementName>
                            <Data>
                                <xsl:value-of select="util:format-date(../RXA/RXA.4/RXA.4.1)"/>

                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Administered Amount</elementName>
                            <xsl:choose>
                                <xsl:when test="../RXA/RXA.6 != 999">
                                    <Data>
                                        <xsl:value-of select="../RXA/RXA.6"/>
                                    </Data>

                                </xsl:when>
                                <xsl:otherwise>
                                    <Data/>
                                </xsl:otherwise>
                            </xsl:choose>

                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Administered Units of Measure </elementName>
                            <Data>
                                <xsl:value-of select="../RXA/RXA.7/RXA.7.1"/>
                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Route of Administration </elementName>
                            <Data>
                                <xsl:value-of select="../RXR/RXR.1/RXR.1.2"/>
                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Administration Site </elementName>
                            <Data>
                                <xsl:value-of select="../RXR/RXR.2/RXR.2.2"/>
                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Substance Manufacturer Name </elementName>
                            <Data>
                                <xsl:value-of select="../RXA/RXA.17/RXA.17.2"/>
                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Administration Notes </elementName>
                            <Data>
                                <xsl:value-of select="../RXA/RXA.9/RXA.9.2"/>
                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Administering Provider</elementName>
                            <Data/>
                            <testerComment/>
                        </element>
                        <element>
                            <elementName>Name</elementName>
                            <Data>
                                <xsl:value-of
                                    select="concat(../RXA/RXA.10/RXA.10.3, ' ', ../RXA/RXA.10/RXA.10.4, ' ', ../RXA/RXA.10/RXA.10.2/RXA.10.2.1)"
                                />
                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>

                        <element>
                            <elementName>ID Number </elementName>
                            <Data>
                                <xsl:value-of select="../RXA/RXA.10/RXA.10.1"/>
                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>

                        <element>
                            <elementName>Administered-at Location</elementName>
                            <Data/>
                            <testerComment/>
                        </element>
                        <element>
                            <elementName>Facility ID</elementName>
                            <Data>
                                <xsl:value-of select="../RXA/RXA.11/RXA.11.4/RXA.11.4.1"/>
                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Street Address</elementName>
                            <Data>
                                <xsl:value-of select="../RXA/RXA.11/RXA.11.9"/>
                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Other Designation</elementName>
                            <Data>
                                <xsl:value-of select="../RXA/RXA.11/RXA.11.10"/>
                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>City</elementName>
                            <Data>
                                <xsl:value-of select="../RXA/RXA.11/RXA.11.11"/>
                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>State</elementName>
                            <Data>
                                <xsl:value-of select="../RXA/RXA.11/RXA.11.12"/>
                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>

                        <element>
                            <elementName>Zip Code</elementName>
                            <Data>
                                <xsl:value-of select="../RXA/RXA.11/RXA.11.13"/>
                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Country</elementName>
                            <Data>
                                <xsl:value-of select="../RXA/RXA.11/RXA.11.14"/>
                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Valid Dose</elementName>
                            <xsl:choose>
                                <xsl:when
                                    test="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59781-5']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                    <xsl:for-each
                                        select="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59781-5']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                        <xsl:if test="position() = 1">
                                            <xsl:choose>
                                                <xsl:when test="OBX/OBX.5/OBX.5.1 = 'Y'">
                                                  <Data>YES</Data>
                                                </xsl:when>
                                                <xsl:when test="OBX/OBX.5/OBX.5.1 = 'N'">
                                                  <Data>NO</Data>
                                                </xsl:when>
                                            </xsl:choose>
                                        </xsl:if>
                                    </xsl:for-each>
                                </xsl:when>
                                <xsl:otherwise>
                                    <Data/>
                                </xsl:otherwise>
                            </xsl:choose>

                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Validity Reason</elementName>
                            <xsl:choose>
                                <xsl:when
                                    test="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30982-3']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                    <xsl:for-each
                                        select="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30982-3']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                        <xsl:if test="position() = 1">

                                            <Data>
                                                <xsl:value-of select="OBX/OBX.5/OBX.5.2"/>
                                            </Data>

                                        </xsl:if>
                                    </xsl:for-each>
                                </xsl:when>
                                <xsl:otherwise>
                                    <Data/>
                                </xsl:otherwise>
                            </xsl:choose>


                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Completion Status*</elementName>
                            <xsl:choose>
                                <xsl:when test="exists(../RXA/RXA.20)">
                                    <xsl:choose>
                                        <xsl:when test="../RXA/RXA.20 = 'CP'">
                                            <Data> Complete </Data>
                                        </xsl:when>
                                        <xsl:when test="../RXA/RXA.20 = 'NA'">
                                            <Data> Not Administered </Data>
                                        </xsl:when>
                                        <xsl:when test="../RXA/RXA.20 = 'PA'">
                                            <Data> Partially Administered </Data>
                                        </xsl:when>
                                        <xsl:when test="../RXA/RXA.20 = 'RE'">
                                            <Data> Refused </Data>
                                        </xsl:when>
                                    </xsl:choose>
                                </xsl:when>
                                <xsl:otherwise>
                                    <Data/>
                                </xsl:otherwise>
                            </xsl:choose>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Dose Number in Series</elementName>
                            <xsl:choose>
                                <xsl:when
                                    test="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30973-2']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                    <xsl:for-each
                                        select="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30973-2']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                        <xsl:if test="position() = 1">

                                            <Data>
                                                <xsl:value-of select="OBX/OBX.5/OBX.5.1"/>
                                            </Data>

                                        </xsl:if>
                                    </xsl:for-each>
                                </xsl:when>
                                <xsl:otherwise>
                                    <Data/>
                                </xsl:otherwise>
                            </xsl:choose>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Number of Doses in Series</elementName>
                            <xsl:choose>
                                <xsl:when
                                    test="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59782-3']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                    <xsl:for-each
                                        select="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59782-3']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                        <xsl:if test="position() = 1">
                                                                       
                                            <Data>
                                                <xsl:value-of select="OBX/OBX.5/OBX.5.1"/>
                                            </Data>
                                            
                                        </xsl:if>
                                    </xsl:for-each>
                                </xsl:when>
                                <xsl:otherwise>
                                    <Data/>
                                </xsl:otherwise>
                            </xsl:choose>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Immunization Series Name</elementName>
                            <xsl:choose>
                                <xsl:when
                                    test="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59780-7']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                    <xsl:for-each
                                        select="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59780-7']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                        <xsl:if test="position() = 1">

                                            <Data>
                                                <xsl:value-of select="OBX/OBX.5/OBX.5.2"/>
                                            </Data>

                                        </xsl:if>
                                    </xsl:for-each>
                                </xsl:when>
                                <xsl:otherwise>
                                    <Data/>
                                </xsl:otherwise>
                            </xsl:choose>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Status in Immunization Series</elementName>
                            <xsl:choose>
                                <xsl:when
                                    test="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59783-1']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                    <xsl:for-each
                                        select="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59783-1']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                        <xsl:if test="position() = 1">

                                            <Data>
                                                <xsl:value-of select="OBX/OBX.5/OBX.5.2"/>
                                            </Data>

                                        </xsl:if>
                                    </xsl:for-each>
                                </xsl:when>
                                <xsl:otherwise>
                                    <Data/>
                                </xsl:otherwise>
                            </xsl:choose>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Immunization Schedule Used</elementName>
                            <xsl:choose>
                                <xsl:when
                                    test="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59779-9']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                    <xsl:for-each
                                        select="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59779-9']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                        <xsl:if test="position() = 1">

                                            <Data>
                                                <xsl:value-of select="OBX/OBX.5/OBX.5.2"/>
                                            </Data>

                                        </xsl:if>
                                    </xsl:for-each>
                                </xsl:when>
                                <xsl:otherwise>
                                    <Data/>
                                </xsl:otherwise>
                            </xsl:choose>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                    </evaluatedImmunizationHistory>
                </xsl:for-each>

            </xsl:for-each>
            <xsl:for-each select="//RXA.5.1[. = '998']/../../..">

                <xsl:for-each select="RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..">
                    <xsl:variable name="position" select="position()"/>
                    <immunizationForecast>
                        <element>
                            <elementName>Vaccine Group</elementName>
                            <Data>
                                <xsl:value-of select="OBX/OBX.5/OBX.5.2"/>
                            </Data>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Vaccine Due Date</elementName>
                            <xsl:choose>

                                <xsl:when
                                    test="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30980-7']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                    <xsl:for-each
                                        select="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30980-7']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                        <xsl:if test="position() = 1">
                                            <Data>
                                                <xsl:value-of
                                                  select="util:format-date(OBX/OBX.5/OBX.5.1)"/>
                                            </Data>
                                        </xsl:if>
                                    </xsl:for-each>
                                </xsl:when>
                                <xsl:otherwise>
                                    <Data/>
                                </xsl:otherwise>
                            </xsl:choose>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Earliest Date to Give</elementName>
                            <xsl:choose>

                                <xsl:when
                                    test="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30981-5']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                    <xsl:for-each
                                        select="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30981-5']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                        <xsl:if test="position() = 1">
                                            <Data>
                                                <xsl:value-of
                                                  select="util:format-date(OBX/OBX.5/OBX.5.1)"/>
                                            </Data>
                                        </xsl:if>
                                    </xsl:for-each>
                                </xsl:when>
                                <xsl:otherwise>
                                    <Data/>
                                </xsl:otherwise>
                            </xsl:choose>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Latest Date to Give</elementName>
                            <xsl:choose>

                                <xsl:when
                                    test="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59777-3']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                    <xsl:for-each
                                        select="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59777-3']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                        <xsl:if test="position() = 1">
                                            <Data>
                                                <xsl:value-of
                                                  select="util:format-date(OBX/OBX.5/OBX.5.1)"/>
                                            </Data>
                                        </xsl:if>
                                    </xsl:for-each>
                                </xsl:when>
                                <xsl:otherwise>
                                    <Data/>
                                </xsl:otherwise>
                            </xsl:choose>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Date When Vaccine Overdue</elementName>
                            <xsl:choose>

                                <xsl:when
                                    test="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59778-1']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                    <xsl:for-each
                                        select="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59778-1']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                        <xsl:if test="position() = 1">
                                            <Data>
                                                <xsl:value-of
                                                  select="util:format-date(OBX/OBX.5/OBX.5.1)"/>
                                            </Data>
                                        </xsl:if>
                                    </xsl:for-each>
                                </xsl:when>
                                <xsl:otherwise>
                                    <Data/>
                                </xsl:otherwise>
                            </xsl:choose>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Status in Immunization Series</elementName>
                            <xsl:choose>

                                <xsl:when
                                    test="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59783-1']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                    <xsl:for-each
                                        select="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59783-1']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                        <xsl:if test="position() = 1">
                                            <Data>
                                                <xsl:value-of select="OBX/OBX.5/OBX.5.2"/>

                                            </Data>
                                        </xsl:if>
                                    </xsl:for-each>
                                </xsl:when>
                                <xsl:otherwise>
                                    <Data/>
                                </xsl:otherwise>
                            </xsl:choose>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                        <element>
                            <elementName>Forecast Reason</elementName>
                            <xsl:choose>


                                <xsl:when
                                    test="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30982-3']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                    <xsl:for-each
                                        select="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30982-3']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                        <xsl:if test="position() = 1">
                                            <Data>
                                                <xsl:value-of select="OBX/OBX.5/OBX.5.2"/>

                                            </Data>
                                        </xsl:if>
                                    </xsl:for-each>
                                </xsl:when>
                                <xsl:otherwise>
                                    <Data/>
                                </xsl:otherwise>
                            </xsl:choose>
                            <testerComment>
                                <xsl:text/>
                            </testerComment>
                        </element>
                    </immunizationForecast>
                </xsl:for-each>
            </xsl:for-each>


        </jurorDocument>
    </xsl:template>
</xsl:stylesheet>
