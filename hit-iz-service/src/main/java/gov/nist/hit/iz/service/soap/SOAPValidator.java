/*
 * NIST Healthcare Core SoapValidator.java July 19, 2011
 * 
 * This code was produced by the National Institute of Standards and Technology (NIST). See the
 * "nist.disclaimer" file given in the distribution for information on the use and redistribution of
 * this software.
 */
package gov.nist.hit.iz.service.soap;

/**
 * @author Caroline Rosin (NIST)
 * @author Mike Indovina (NIST)
 */

import gov.nist.healthcare.core.util.XmlBeansUtils;
import gov.nist.healthcare.core.validation.message.MessageValidationConstants;
import gov.nist.healthcare.core.validation.message.structure.v3.SkeletonURIResolver;
import gov.nist.healthcare.core.validation.message.v3.MessageFailureV3;
import gov.nist.healthcare.validation.AssertionTypeV3Constants;
import gov.nist.healthcare.validation.ErrorSeverityConstants;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.xml.transform.Source;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.URIResolver;
import javax.xml.transform.dom.DOMResult;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;

import org.apache.xmlbeans.StringEnumAbstractBase;
import org.apache.xmlbeans.XmlCursor;
import org.apache.xmlbeans.XmlError;
import org.apache.xmlbeans.XmlException;
import org.apache.xmlbeans.XmlObject;
import org.apache.xmlbeans.XmlOptions;
import org.w3c.dom.Node;

public class SOAPValidator {

  /**
   * Validate a SoapMessage against the W3C schema
   * 
   * @param soapMessage
   * @return
   */
  public ArrayList<MessageFailureV3> validate(XmlObject soapMessage) {
    ArrayList<MessageFailureV3> schemaFailures = validateWithSchema(soapMessage);
    return schemaFailures;
  }

  /**
   * Validate a SoapMessage against the W3C schema and schematron rules
   * 
   * @param soapMessage
   * @param schematron
   * @return
   * @throws XmlException
   */
  public ArrayList<MessageFailureV3> validate(XmlObject soapMessage, File schematron, String phase)
      throws XmlException {
    ArrayList<MessageFailureV3> result = new ArrayList<MessageFailureV3>();
    ArrayList<MessageFailureV3> schemaFailures = validateWithSchema(soapMessage);
    List<MessageFailureV3> schematronFailures =
        validateWithSchematron(soapMessage, schematron, phase);
    if (schemaFailures != null) {
      result.addAll(schemaFailures);
    }
    if (schematronFailures != null) {
      result.addAll(schematronFailures);
    }
    return result;
  }

  public ArrayList<MessageFailureV3> validate(XmlObject soapMessage, InputStream schematron,
      String phase) throws XmlException {
    ArrayList<MessageFailureV3> result = new ArrayList<MessageFailureV3>();
    ArrayList<MessageFailureV3> schemaFailures = validateWithSchema(soapMessage);
    List<MessageFailureV3> schematronFailures =
        validateWithSchematron(soapMessage, schematron, phase);

    if (schemaFailures != null) {
      result.addAll(schemaFailures);
    }
    if (schematronFailures != null) {
      result.addAll(schematronFailures);
    }
    return result;
  }

  // public String readFile(String path) throws IOException {
  // BufferedReader input = new BufferedReader(
  // new FileReader(new File(path)));
  // String line = null;
  // StringBuilder xml = new StringBuilder();
  // while ((line = input.readLine()) != null) {
  // xml.append(line);
  // }
  // return xml.toString();
  // }

  private ArrayList<MessageFailureV3> validateWithSchema(XmlObject myDoc) {
    ArrayList<MessageFailureV3> failures = new ArrayList<MessageFailureV3>();
    ArrayList<XmlError> validationErrors = new ArrayList<XmlError>();
    /* We don't want to validate the content of Body */
    XmlOptions options = new XmlOptions();
    options.setValidateTreatLaxAsSkip();
    validationErrors.addAll(XmlBeansUtils.validate(myDoc, options));
    if (validationErrors.size() > 0) {
      Iterator<XmlError> iter = validationErrors.iterator();
      while (iter.hasNext()) {
        XmlError xmlError = iter.next();
        MessageFailureV3 mf = new MessageFailureV3();
        mf.setFailureType(AssertionTypeV3Constants.SOAP);
        mf.setFailureSeverity(ErrorSeverityConstants.NORMAL);
        mf.setDescription(xmlError.getMessage());
        XmlCursor cursor = xmlError.getCursorLocation();
        if (cursor != null && cursor.getName() != null) {
          try {
            String path = XmlBeansUtils.getXPathForElement(cursor.getObject());
            mf.setPath(path);
          } catch (Exception e) {
            ;
          }
        }
        failures.add(mf);
      }
    }

    /* Header check : WSA */
    XmlCursor cur = myDoc.newCursor();
    if (!cur.isStartdoc()) {
      cur.toStartDoc();
    }
    cur.toFirstChild();
    String ns = cur.getName().getNamespaceURI();
    if (cur.toChild(ns, "Header")) {
      failures.addAll(checkElement(cur.getObject(), AssertionTypeV3Constants.WSA));
    }
    return failures;
  }

  private ArrayList<MessageFailureV3> checkElement(XmlObject myDoc,
      StringEnumAbstractBase failureType) {
    ArrayList<MessageFailureV3> failures = new ArrayList<MessageFailureV3>();
    ArrayList<XmlError> validationErrors = new ArrayList<XmlError>();
    validationErrors.addAll(XmlBeansUtils.validate(myDoc));
    if (validationErrors.size() > 0) {
      Iterator<XmlError> iter = validationErrors.iterator();
      while (iter.hasNext()) {
        XmlError xmlError = iter.next();
        MessageFailureV3 mf = new MessageFailureV3();
        mf.setFailureType(failureType);
        mf.setFailureSeverity(ErrorSeverityConstants.NORMAL);
        mf.setDescription(xmlError.getMessage());

        XmlCursor cursor = xmlError.getCursorLocation();
        if (cursor != null && cursor.getName() != null) {
          try {
            String path = XmlBeansUtils.getXPathForElement(cursor.getObject());
            mf.setPath(path);
          } catch (Exception e) {
            ;
          }
        }
        failures.add(mf);
      }
    }
    return failures;
  }

  // validateWithSchematron( ... ) does schematron validation, but not in the
  // most efficient way. For stable schematron, it would be more efficient
  // to run the schematron through the skeleton transform once, save that
  // transformation to a file and then simply reuse that transform rather than
  // generating it on every run. That is left as an exercise for the
  // implementor.

  private List<MessageFailureV3> validateWithSchematron(XmlObject xml, File schematronFile,
      String phase) throws XmlException {
    StringBuilder result = new StringBuilder();
    StreamSource schematron = new StreamSource(schematronFile);
    StreamSource skeleton =
        new StreamSource(SOAPValidator.class.getClassLoader().getResourceAsStream(
            MessageValidationConstants.XSLT_SKELETON));
    // MDI: I think this next line converts a "phase" section in the Schematron file to XSLT, with
    // the results going into 'schematronTransform'
    // MDI: but what is 'skeleton' and how is it used here???

    Node schematronTransform = doTransform(schematron, skeleton, phase);
    result.append(doTransform(xml.getDomNode(), schematronTransform));
    XmlObject xmlResult = XmlObject.Factory.parse(result.toString());
    return getMessageFailures(xmlResult);
  }

  private List<MessageFailureV3> validateWithSchematron(XmlObject xml, InputStream schematronFile,
      String phase) throws XmlException {
    StringBuilder result = new StringBuilder();
    StreamSource schematron = new StreamSource(schematronFile);
    StreamSource skeleton =
        new StreamSource(SOAPValidator.class.getClassLoader().getResourceAsStream(
            MessageValidationConstants.XSLT_SKELETON));
    Node schematronTransform = doTransform(schematron, skeleton, phase);
    result.append(doTransform(xml.getDomNode(), schematronTransform));
    XmlObject xmlResult = XmlObject.Factory.parse(result.toString());
    return getMessageFailures(xmlResult);
  }

  private Node doTransform(StreamSource xmlSource, StreamSource xsltSource, String phase) {
    System.setProperty("javax.xml.transform.TransformerFactory",
        "net.sf.saxon.TransformerFactoryImpl");
    DOMResult result = new DOMResult();
    try {
      TransformerFactory tFactory = TransformerFactory.newInstance();
      URIResolver resolver = new SkeletonURIResolver();
      tFactory.setURIResolver(resolver);
      Transformer transformer = tFactory.newTransformer(xsltSource);
      transformer.setParameter("phase", phase);
      transformer.transform(xmlSource, result);

      TransformerFactory transFactory = TransformerFactory.newInstance();
      Transformer mytransformer = transFactory.newTransformer();
      StringWriter buffer = new StringWriter();
      // transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
      mytransformer.transform(new DOMSource(result.getNode()), new StreamResult(buffer));
      String str = buffer.toString();

    } catch (TransformerConfigurationException tce) {
      tce.printStackTrace();
      return null;
    } catch (TransformerException te) {
      te.printStackTrace();
      return null;
    } finally {
      System.clearProperty("javax.xml.transform.TransformerFactory");
    }
    return result.getNode();
  }

  private String doTransform(Node originalXml, Node transform) {
    System.setProperty("javax.xml.transform.TransformerFactory",
        "net.sf.saxon.TransformerFactoryImpl");
    ByteArrayOutputStream os = new ByteArrayOutputStream();
    StreamResult result = new StreamResult(os);
    try {
      Source xmlSource = new DOMSource(originalXml);
      Source xsltSource = new DOMSource(transform);
      Transformer transformer = TransformerFactory.newInstance().newTransformer(xsltSource);
      transformer.transform(xmlSource, result);
    } catch (TransformerConfigurationException tce) {
      tce.printStackTrace();
      return null;
    } catch (TransformerException te) {
      te.printStackTrace();
      return null;
    } finally {
      System.clearProperty("javax.xml.transform.TransformerFactory");
    }

    return os.toString();
  }

  private List<MessageFailureV3> getMessageFailures(XmlObject xmlResult) {
    List<MessageFailureV3> failures = new ArrayList<MessageFailureV3>();
    XmlObject[] results = xmlResult.selectPath("/Results");
    for (XmlObject result : results) {
      XmlObject[] xmlIssues = result.selectPath("issue");
      if (xmlIssues != null) {
        for (XmlObject xmlIssue : xmlIssues) {
          MessageFailureV3 mf = new MessageFailureV3();
          mf.setFailureType(AssertionTypeV3Constants.SOAP);
          mf.setFailureSeverity(ErrorSeverityConstants.NORMAL);
          mf.setDescription(getIssueMessage(xmlIssue));
          mf.setPath(getIssueContext(xmlIssue));
          // mf.setAssertionDeclaration(getIssueTest(xmlIssue));
          failures.add(mf);
        }
      }
    }
    return failures;
  }

  private String getValue(XmlObject obj, String path) {
    String value = null;
    XmlObject[] res = obj.selectPath(path);
    if (res != null && res.length != 0) {
      value = res[0].newCursor().getTextValue();
    }
    return value;
  }

  private String getIssueMessage(XmlObject issue) {
    String message = getValue(issue, "message");
    return message;
  }

  private String getIssueContext(XmlObject issue) {
    String message = getValue(issue, "context");
    return message;
  }

  // private String getIssueTest(XmlObject issue) {
  // String message = getValue(issue, "test");
  // return message;
  // }
}
