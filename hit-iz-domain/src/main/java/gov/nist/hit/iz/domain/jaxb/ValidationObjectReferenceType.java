//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, v2.2.8-b130911.1802 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2017.10.11 at 09:15:39 PM EDT 
//


package gov.nist.hit.iz.domain.jaxb;

import javax.xml.bind.annotation.XmlEnum;
import javax.xml.bind.annotation.XmlEnumValue;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for ValidationObjectReferenceType.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * <p>
 * <pre>
 * &lt;simpleType name="ValidationObjectReferenceType">
 *   &lt;restriction base="{http://www.w3.org/2001/XMLSchema}string">
 *     &lt;enumeration value="Profile"/>
 *     &lt;enumeration value="Validation Context"/>
 *   &lt;/restriction>
 * &lt;/simpleType>
 * </pre>
 * 
 */
@XmlType(name = "ValidationObjectReferenceType")
@XmlEnum
public enum ValidationObjectReferenceType {

    @XmlEnumValue("Profile")
    PROFILE("Profile"),
    @XmlEnumValue("Validation Context")
    VALIDATION_CONTEXT("Validation Context");
    private final String value;

    ValidationObjectReferenceType(String v) {
        value = v;
    }

    public String value() {
        return value;
    }

    public static ValidationObjectReferenceType fromValue(String v) {
        for (ValidationObjectReferenceType c: ValidationObjectReferenceType.values()) {
            if (c.value.equals(v)) {
                return c;
            }
        }
        throw new IllegalArgumentException(v);
    }

}
