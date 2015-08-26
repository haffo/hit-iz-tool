<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:util="http://hl7.nist.gov/juror-doc/util" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="xs util" version="2.0">
    <xsl:output method="xml" indent="yes"/>
    <xsl:template match="/">
        <jurorDocument>
            <xsl:choose>
                <xsl:when test="exists(//ERR)">

                    <returnAcknowledgement>
                        <xsl:text>The receiving HIT system being tested shall process the Z23 ACK error notification message correctly; the issue identified in the error notification must be made visible in the system.</xsl:text>
                        <!-- <xsl:for-each select="//ERR">
                            <p align="center">
                                <xsl:value-of select="ERR.8"/>
                            </p>
                        </xsl:for-each> -->
                    </returnAcknowledgement>

                </xsl:when>
                <xsl:otherwise>
                    <returnAcknowledgement>
                        <xsl:text>The receiving HIT system being tested shall process
                                                the Z23 ACK message correctly; a positive
                                                notification indicating that the ACK message was
                                                processed correctly need not be made visible
                                                in the system.</xsl:text>
                    </returnAcknowledgement>
                </xsl:otherwise>
            </xsl:choose>
        </jurorDocument>

    </xsl:template>
</xsl:stylesheet>
