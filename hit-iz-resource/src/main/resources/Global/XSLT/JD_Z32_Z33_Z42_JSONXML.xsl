<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:util="http://hl7.nist.gov/juror-doc/util" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="xs util" version="2.0">
    <xsl:output method="xml" indent="yes"/>
    <!--  <xsl:template name="dateTime">
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
            <!-- <xsl:value-of select="format-date(xs:date(concat($month,$day,$year)),'[D1o] 
				[MNn], [Y]', 'en', (), ())"/> -->
        </xsl:if>
    </xsl:function>
    <xsl:template match="PID">

        <patientIdentifier>
            <xsl:value-of select="PID.3[1]/PID.3.1"/>
        </patientIdentifier>

        <patientName>
            <xsl:value-of
                select="concat(PID.5/PID.5.2, ' ', PID.5/PID.5.3, ' ', PID.5/PID.5.1/PID.5.1.1)"/>
        </patientName>

        <xsl:choose>
            <xsl:when test="PID.7/PID.7.1 != ''">
                <DOB>
                    <xsl:value-of select="util:format-date(PID.7/PID.7.1)"/>
                    <!-- <xsl:call-template name="dateTime">
                        <xsl:with-param name="dateS" select="PID.7/PID.7.1"/>
                    </xsl:call-template> -->
                </DOB>
            </xsl:when>
            <xsl:otherwise>
                <DOB/>
            </xsl:otherwise>
        </xsl:choose>

        <xsl:choose>
            <xsl:when test="PID.8 != ''">
                <xsl:choose>
                    <xsl:when test="PID.8 = 'F'">
                        <gender> Female </gender>
                    </xsl:when>
                    <xsl:when test="PID.8 = 'M'">
                        <gender> Male </gender>
                    </xsl:when>
                    <xsl:when test="PID.8 = 'U'">
                        <gender>
                            <xsl:value-of select="'Unknown/undifferentiated'"/>
                        </gender>
                    </xsl:when>
                    <xsl:otherwise>
                        <gender>
                            <xsl:value-of select="PID.8"/>
                        </gender>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
                <gender/>
            </xsl:otherwise>
        </xsl:choose>
        <testerComment>
            <xsl:text/>
        </testerComment>
    </xsl:template>
    <xsl:template match="QPD">

        <patientIdentifier>
            <xsl:value-of select="QPD.3[1]/QPD.3.1"/>
        </patientIdentifier>

        <patientName>
            <xsl:value-of
                select="concat(QPD.4/QPD.4.2, ' ', QPD.4/QPD.4.3, ' ', QPD.4/QPD.4.1/QPD.4.1.1)"/>
        </patientName>

        <xsl:choose>
            <xsl:when test="QPD.6/QPD.6.1 != ''">
                <DOB>
                    <xsl:value-of select="util:format-date(QPD.6/QPD.6.1)"/>
                    <!-- <xsl:call-template name="dateTime">
                        <xsl:with-param name="dateS" select="QPD.6/QPD.6.1"/>
                    </xsl:call-template> -->
                </DOB>
            </xsl:when>
            <xsl:otherwise>
                <DOB/>
            </xsl:otherwise>
        </xsl:choose>

        <xsl:choose>
            <xsl:when test="QPD.7 != ''">
                <xsl:choose>
                    <xsl:when test="QPD.7 = 'F'">
                        <gender> Female </gender>
                    </xsl:when>
                    <xsl:when test="QPD.7 = 'M'">
                        <gender> Male </gender>
                    </xsl:when>
                    <xsl:when test="QPD.7 = 'U'">
                        <gender>
                            <xsl:value-of select="'Unknown/undifferentiated'"/>
                        </gender>
                    </xsl:when>
                    <xsl:otherwise>
                        <gender>
                            <xsl:value-of select="QPD.7"/>
                        </gender>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
                <gender/>
            </xsl:otherwise>
        </xsl:choose>
        <testerComment>
            <xsl:text/>
        </testerComment>
    </xsl:template>
    <xsl:template match="/">
        <xsl:choose>
            <xsl:when test="//QAK/QAK.2[. = 'OK']">
                <jurorDocument>
                    <patientInformation>
                        <xsl:apply-templates select="//PID"/>
                    </patientInformation>
                    <immunizationScheduleUsed>

                        <immunizationSchedule>
                            <xsl:value-of
                                select="distinct-values(//OBX.3.1[. = '59779-9']/../../OBX.5/OBX.5.2)"
                            />
                        </immunizationSchedule>
                        <testerComment>
                            <xsl:text/>
                        </testerComment>
                    </immunizationScheduleUsed>

                    <xsl:for-each select="//RXA.5.1[. != '998']/../../..">
                        <xsl:for-each
                            select="RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..">

                            <xsl:variable name="position" select="position()"/>
                            <evaluatedImmunizationHistory>
                                <vaccineGroup>
                                    <xsl:value-of select="OBX/OBX.5/OBX.5.2"/>
                                </vaccineGroup>
                                <vaccineAdministered>
                                    <xsl:value-of select="../RXA/RXA.5/RXA.5.2"/>
                                </vaccineAdministered>
                                <xsl:choose>

                                    <xsl:when test="../RXA/RXA.3/RXA.3.1 != ''">
                                        <dateAdministered>
                                            <xsl:value-of
                                                select="util:format-date(../RXA/RXA.3/RXA.3.1)"/>
                                            <!-- <xsl:call-template name="dateTime">
                                    <xsl:with-param name="dateS" select="../RXA/RXA.3/RXA.3.1"></xsl:with-param>
                                </xsl:call-template> -->
                                        </dateAdministered>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <dateAdministered/>
                                    </xsl:otherwise>
                                </xsl:choose>

                                <xsl:choose>
                                    <xsl:when
                                        test="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59781-5']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                        <xsl:for-each
                                            select="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59781-5']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                            <xsl:if test="position() = 1">
                                                <xsl:choose>
                                                  <xsl:when test="OBX/OBX.5/OBX.5.1 = 'Y'">
                                                  <validDose>YES</validDose>
                                                  </xsl:when>
                                                  <xsl:when test="OBX/OBX.5/OBX.5.1 = 'N'">
                                                  <validDose>NO</validDose>
                                                  </xsl:when>
                                                  <xsl:otherwise>
                                                  <validDose> </validDose>
                                                  </xsl:otherwise>
                                                </xsl:choose>
                                            </xsl:if>
                                        </xsl:for-each>
                                    </xsl:when>

                                </xsl:choose>
                                <xsl:choose>
                                    <xsl:when
                                        test="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30982-3']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                        <xsl:for-each
                                            select="following-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30982-3']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                            <xsl:if test="position() = 1">

                                                <validityReason>
                                                  <xsl:value-of select="OBX/OBX.5/OBX.5.1"/>
                                                </validityReason>

                                            </xsl:if>
                                        </xsl:for-each>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <validityReason> </validityReason>
                                    </xsl:otherwise>
                                </xsl:choose>
                                <xsl:choose>
                                    <xsl:when test="exists(../RXA/RXA.20)">
                                        <xsl:choose>
                                            <xsl:when test="../RXA/RXA.20 = 'CP'">
                                                <completionStatus> Complete </completionStatus>
                                            </xsl:when>
                                            <xsl:when test="../RXA/RXA.20 = 'NA'">
                                                <completionStatus> Not Administered
                                                </completionStatus>
                                            </xsl:when>
                                            <xsl:when test="../RXA/RXA.20 = 'PA'">
                                                <completionStatus> Partially Administered
                                                </completionStatus>
                                            </xsl:when>
                                            <xsl:when test="../RXA/RXA.20 = 'RE'">
                                                <completionStatus> Refused </completionStatus>
                                            </xsl:when>
                                        </xsl:choose>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <completionStatus> </completionStatus>
                                    </xsl:otherwise>
                                </xsl:choose>
                                <testerComment>
                                    <xsl:text/>
                                </testerComment>
                            </evaluatedImmunizationHistory>
                        </xsl:for-each>

                    </xsl:for-each>
                    <xsl:for-each select="//RXA.5.1[. = '998']/../../..">

                        <xsl:for-each
                            select="RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..">
                            <xsl:variable name="position" select="position()"/>
                            <immunizationForecast>
                                <vaccineGroup>
                                    <xsl:value-of select="OBX/OBX.5/OBX.5.2"/>
                                </vaccineGroup>
                                <xsl:choose>

                                    <xsl:when
                                        test="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30980-7']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                        <xsl:for-each
                                            select="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30980-7']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                            <xsl:if test="position() = 1">
                                                <xsl:choose>

                                                  <xsl:when test="OBX/OBX.5/OBX.5.1 != ''">

                                                  <dueDate>
                                                  <xsl:value-of
                                                  select="util:format-date(OBX/OBX.5/OBX.5.1)"/>
                                                  <!--  <xsl:call-template name="dateTime">
                                                    <xsl:with-param name="dateS" select="OBX.5/OBX.5.1"></xsl:with-param>
                                                </xsl:call-template> -->
                                                  </dueDate>
                                                  </xsl:when>
                                                  <xsl:otherwise>
                                                  <dueDate/>
                                                  </xsl:otherwise>
                                                </xsl:choose>
                                            </xsl:if>
                                        </xsl:for-each>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <dueDate/>
                                    </xsl:otherwise>
                                </xsl:choose>
                                <xsl:choose>

                                    <xsl:when
                                        test="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30981-5']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                        <xsl:for-each
                                            select="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30981-5']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                            <xsl:if test="position() = 1">
                                                <xsl:choose>

                                                  <xsl:when test="OBX/OBX.5/OBX.5.1 != ''">

                                                  <earlyDate>
                                                  <xsl:value-of
                                                  select="util:format-date(OBX/OBX.5/OBX.5.1)"/>
                                                  <!--  <xsl:call-template name="dateTime">
                                                    <xsl:with-param name="dateS" select="OBX.5/OBX.5.1"></xsl:with-param>
                                                </xsl:call-template> -->
                                                  </earlyDate>
                                                  </xsl:when>
                                                  <xsl:otherwise>
                                                  <earlyDate/>
                                                  </xsl:otherwise>
                                                </xsl:choose>
                                            </xsl:if>
                                        </xsl:for-each>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <earlyDate/>
                                    </xsl:otherwise>
                                </xsl:choose>
                                <xsl:choose>

                                    <xsl:when
                                        test="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59777-3']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                        <xsl:for-each
                                            select="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59777-3']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                            <xsl:if test="position() = 1">
                                                <xsl:choose>

                                                  <xsl:when test="OBX/OBX.5/OBX.5.1 != ''">
                                                  <latestDate>
                                                  <xsl:value-of
                                                  select="util:format-date(OBX/OBX.5/OBX.5.1)"/>
                                                  <!--
                                                    <xsl:call-template name="dateTime">
                                                        <xsl:with-param name="dateS"
                                                            select="OBX.5/OBX.5.1"/>
                                                    </xsl:call-template>  -->
                                                  </latestDate>
                                                  </xsl:when>
                                                  <xsl:otherwise>
                                                  <latestDate/>
                                                  </xsl:otherwise>
                                                </xsl:choose>
                                            </xsl:if>
                                        </xsl:for-each>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <latestDate/>
                                    </xsl:otherwise>
                                </xsl:choose>
                                <!-- 
                                <xsl:choose>

                                    <xsl:when
                                        test="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59783-1']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                        <xsl:for-each
                                            select="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '59783-1']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                            <xsl:if test="position() = 1">
                                                <seriesStatus>
                                                  <xsl:value-of select="OBX/OBX.5/OBX.5.2"/>

                                                </seriesStatus>
                                            </xsl:if>
                                        </xsl:for-each>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <seriesStatus/>
                                    </xsl:otherwise>
                                </xsl:choose>
                                <xsl:choose>

                                    <xsl:when
                                        test="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30982-3']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                        <xsl:for-each
                                            select="following::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30982-3']/../../..[count(preceding-sibling::RSP_K11.OBSERVATION/OBX/OBX.3/OBX.3.1[. = '30956-7']/../../..) = $position]">
                                            <xsl:if test="position() = 1">
                                                <forecastReason>
                                                  <xsl:value-of select="OBX/OBX.5/OBX.5.2"/>

                                                </forecastReason>
                                            </xsl:if>
                                        </xsl:for-each>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <forecastReason/>
                                    </xsl:otherwise>
                                </xsl:choose> -->
                                <testerComment>
                                    <xsl:text/>
                                </testerComment>
                            </immunizationForecast>
                        </xsl:for-each>
                    </xsl:for-each>
                </jurorDocument>
            </xsl:when>
            <xsl:when test="//QAK/QAK.2[. = 'NF']">
                <jurorDocument>
                    <patientInformation>
                        <xsl:apply-templates select="//QPD"/>
                    </patientInformation>
                    <evaluatedHistoryandForecast>
                        <xsl:text>The EHR shall display a notification indicating that the 
query for an Evaluated Immunization History and Immunization Forecast
is complete but no matching records were found for the person in the query</xsl:text>
                    </evaluatedHistoryandForecast>
                </jurorDocument>
            </xsl:when>
            <xsl:when test="//QAK/QAK.2[. = 'TM']">
                <jurorDocument>
                    <patientInformation>
                        <xsl:apply-templates select="//QPD"/>
                    </patientInformation>
                    <evaluatedHistoryandForecast>
                        <xsl:text>The EHR shall display a notification indicating that the 
query for an Evaluated Immunization History and Immunization Forecast
is complete but too many matching records were found for the person in the query</xsl:text>
                    </evaluatedHistoryandForecast>
                </jurorDocument>
            </xsl:when>
        </xsl:choose>

    </xsl:template>
</xsl:stylesheet>
