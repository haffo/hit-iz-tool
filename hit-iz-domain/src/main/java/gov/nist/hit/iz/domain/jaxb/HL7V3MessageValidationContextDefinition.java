//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, v2.2.8-b130911.1802 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2017.10.11 at 09:14:57 PM EDT 
//


package gov.nist.hit.iz.domain.jaxb;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for HL7V3MessageValidationContextDefinition complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="HL7V3MessageValidationContextDefinition">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="FailureInterpretation" type="{http://www.nist.gov/healthcare/validation/message/hl7/v3/context}MessageFailureInterpretationV3"/>
 *         &lt;element name="MessageInstanceSpecificValues" type="{http://www.nist.gov/healthcare/validation/message/hl7/v3/context}MessageInstanceSpecificValuesV3" minOccurs="0"/>
 *         &lt;element name="IfThenElse" maxOccurs="unbounded" minOccurs="0">
 *           &lt;complexType>
 *             &lt;complexContent>
 *               &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *                 &lt;sequence>
 *                   &lt;element name="If" type="{http://www.nist.gov/healthcare/validation/message/hl7/v3/context}DataValueLocationItemV3"/>
 *                   &lt;element name="Then" type="{http://www.nist.gov/healthcare/validation/message/hl7/v3/context}DataValueLocationItemV3"/>
 *                   &lt;element name="Else" type="{http://www.nist.gov/healthcare/validation/message/hl7/v3/context}DataValueLocationItemV3" minOccurs="0"/>
 *                 &lt;/sequence>
 *                 &lt;attribute name="MatchingSegmentInstanceNumber" type="{http://www.w3.org/2001/XMLSchema}boolean" />
 *                 &lt;attribute name="MatchingFieldInstanceNumber" type="{http://www.w3.org/2001/XMLSchema}boolean" />
 *               &lt;/restriction>
 *             &lt;/complexContent>
 *           &lt;/complexType>
 *         &lt;/element>
 *         &lt;element name="PluginCheck" type="{http://www.nist.gov/healthcare/validation}PluginCheckType" maxOccurs="unbounded" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "HL7V3MessageValidationContextDefinition", namespace = "http://www.nist.gov/healthcare/validation/message/hl7/v3/context", propOrder = {
    "failureInterpretation",
    "messageInstanceSpecificValues",
    "ifThenElse",
    "pluginCheck"
})
public class HL7V3MessageValidationContextDefinition {

    @XmlElement(name = "FailureInterpretation", required = true)
    protected MessageFailureInterpretationV3 failureInterpretation;
    @XmlElement(name = "MessageInstanceSpecificValues")
    protected MessageInstanceSpecificValuesV3 messageInstanceSpecificValues;
    @XmlElement(name = "IfThenElse")
    protected List<HL7V3MessageValidationContextDefinition.IfThenElse> ifThenElse;
    @XmlElement(name = "PluginCheck")
    protected List<PluginCheckType> pluginCheck;

    /**
     * Gets the value of the failureInterpretation property.
     * 
     * @return
     *     possible object is
     *     {@link MessageFailureInterpretationV3 }
     *     
     */
    public MessageFailureInterpretationV3 getFailureInterpretation() {
        return failureInterpretation;
    }

    /**
     * Sets the value of the failureInterpretation property.
     * 
     * @param value
     *     allowed object is
     *     {@link MessageFailureInterpretationV3 }
     *     
     */
    public void setFailureInterpretation(MessageFailureInterpretationV3 value) {
        this.failureInterpretation = value;
    }

    /**
     * Gets the value of the messageInstanceSpecificValues property.
     * 
     * @return
     *     possible object is
     *     {@link MessageInstanceSpecificValuesV3 }
     *     
     */
    public MessageInstanceSpecificValuesV3 getMessageInstanceSpecificValues() {
        return messageInstanceSpecificValues;
    }

    /**
     * Sets the value of the messageInstanceSpecificValues property.
     * 
     * @param value
     *     allowed object is
     *     {@link MessageInstanceSpecificValuesV3 }
     *     
     */
    public void setMessageInstanceSpecificValues(MessageInstanceSpecificValuesV3 value) {
        this.messageInstanceSpecificValues = value;
    }

    /**
     * Gets the value of the ifThenElse property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the ifThenElse property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getIfThenElse().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link HL7V3MessageValidationContextDefinition.IfThenElse }
     * 
     * 
     */
    public List<HL7V3MessageValidationContextDefinition.IfThenElse> getIfThenElse() {
        if (ifThenElse == null) {
            ifThenElse = new ArrayList<HL7V3MessageValidationContextDefinition.IfThenElse>();
        }
        return this.ifThenElse;
    }

    /**
     * Gets the value of the pluginCheck property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the pluginCheck property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getPluginCheck().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link PluginCheckType }
     * 
     * 
     */
    public List<PluginCheckType> getPluginCheck() {
        if (pluginCheck == null) {
            pluginCheck = new ArrayList<PluginCheckType>();
        }
        return this.pluginCheck;
    }


    /**
     * <p>Java class for anonymous complex type.
     * 
     * <p>The following schema fragment specifies the expected content contained within this class.
     * 
     * <pre>
     * &lt;complexType>
     *   &lt;complexContent>
     *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
     *       &lt;sequence>
     *         &lt;element name="If" type="{http://www.nist.gov/healthcare/validation/message/hl7/v3/context}DataValueLocationItemV3"/>
     *         &lt;element name="Then" type="{http://www.nist.gov/healthcare/validation/message/hl7/v3/context}DataValueLocationItemV3"/>
     *         &lt;element name="Else" type="{http://www.nist.gov/healthcare/validation/message/hl7/v3/context}DataValueLocationItemV3" minOccurs="0"/>
     *       &lt;/sequence>
     *       &lt;attribute name="MatchingSegmentInstanceNumber" type="{http://www.w3.org/2001/XMLSchema}boolean" />
     *       &lt;attribute name="MatchingFieldInstanceNumber" type="{http://www.w3.org/2001/XMLSchema}boolean" />
     *     &lt;/restriction>
     *   &lt;/complexContent>
     * &lt;/complexType>
     * </pre>
     * 
     * 
     */
    @XmlAccessorType(XmlAccessType.FIELD)
    @XmlType(name = "", propOrder = {
        "_if",
        "then",
        "_else"
    })
    public static class IfThenElse {

        @XmlElement(name = "If", namespace = "http://www.nist.gov/healthcare/validation/message/hl7/v3/context", required = true)
        protected DataValueLocationItemV3 _if;
        @XmlElement(name = "Then", namespace = "http://www.nist.gov/healthcare/validation/message/hl7/v3/context", required = true)
        protected DataValueLocationItemV3 then;
        @XmlElement(name = "Else", namespace = "http://www.nist.gov/healthcare/validation/message/hl7/v3/context")
        protected DataValueLocationItemV3 _else;
        @XmlAttribute(name = "MatchingSegmentInstanceNumber")
        protected Boolean matchingSegmentInstanceNumber;
        @XmlAttribute(name = "MatchingFieldInstanceNumber")
        protected Boolean matchingFieldInstanceNumber;

        /**
         * Gets the value of the if property.
         * 
         * @return
         *     possible object is
         *     {@link DataValueLocationItemV3 }
         *     
         */
        public DataValueLocationItemV3 getIf() {
            return _if;
        }

        /**
         * Sets the value of the if property.
         * 
         * @param value
         *     allowed object is
         *     {@link DataValueLocationItemV3 }
         *     
         */
        public void setIf(DataValueLocationItemV3 value) {
            this._if = value;
        }

        /**
         * Gets the value of the then property.
         * 
         * @return
         *     possible object is
         *     {@link DataValueLocationItemV3 }
         *     
         */
        public DataValueLocationItemV3 getThen() {
            return then;
        }

        /**
         * Sets the value of the then property.
         * 
         * @param value
         *     allowed object is
         *     {@link DataValueLocationItemV3 }
         *     
         */
        public void setThen(DataValueLocationItemV3 value) {
            this.then = value;
        }

        /**
         * Gets the value of the else property.
         * 
         * @return
         *     possible object is
         *     {@link DataValueLocationItemV3 }
         *     
         */
        public DataValueLocationItemV3 getElse() {
            return _else;
        }

        /**
         * Sets the value of the else property.
         * 
         * @param value
         *     allowed object is
         *     {@link DataValueLocationItemV3 }
         *     
         */
        public void setElse(DataValueLocationItemV3 value) {
            this._else = value;
        }

        /**
         * Gets the value of the matchingSegmentInstanceNumber property.
         * 
         * @return
         *     possible object is
         *     {@link Boolean }
         *     
         */
        public Boolean isMatchingSegmentInstanceNumber() {
            return matchingSegmentInstanceNumber;
        }

        /**
         * Sets the value of the matchingSegmentInstanceNumber property.
         * 
         * @param value
         *     allowed object is
         *     {@link Boolean }
         *     
         */
        public void setMatchingSegmentInstanceNumber(Boolean value) {
            this.matchingSegmentInstanceNumber = value;
        }

        /**
         * Gets the value of the matchingFieldInstanceNumber property.
         * 
         * @return
         *     possible object is
         *     {@link Boolean }
         *     
         */
        public Boolean isMatchingFieldInstanceNumber() {
            return matchingFieldInstanceNumber;
        }

        /**
         * Sets the value of the matchingFieldInstanceNumber property.
         * 
         * @param value
         *     allowed object is
         *     {@link Boolean }
         *     
         */
        public void setMatchingFieldInstanceNumber(Boolean value) {
            this.matchingFieldInstanceNumber = value;
        }

    }

}
