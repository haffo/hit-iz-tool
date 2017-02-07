package gov.nist.hit.iz.ws.server;

import java.io.IOException;
import java.math.BigInteger;

import javax.xml.bind.JAXBException;
import javax.xml.transform.Result;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;

import org.springframework.oxm.XmlMappingException;
import org.springframework.ws.soap.SoapFault;
import org.springframework.ws.soap.SoapFaultDetail;
import org.springframework.ws.soap.server.endpoint.SoapFaultMappingExceptionResolver;
import org.springframework.xml.transform.StringSource;

import gov.nist.hit.core.transport.exception.TransportServerException;
import gov.nist.hit.iz.ws.jaxb.MessageTooLargeFaultType;
import gov.nist.hit.iz.ws.jaxb.SecurityFaultType;
import gov.nist.hit.iz.ws.jaxb.SoapFaultType;
import gov.nist.hit.iz.ws.jaxb.UnsupportedOperationFaultType;
import gov.nist.hit.iz.ws.server.exception.MessageTooLargeException;
import gov.nist.hit.iz.ws.utils.WsdlUtil;

public class SoapFaultDetailsDefinitionExceptionResolver extends SoapFaultMappingExceptionResolver {

	private static final BigInteger MESSAGETOOLARGEFAULT_CODE = BigInteger.valueOf(1000);
	private static final BigInteger SECURITYFAULT_CODE = BigInteger.valueOf(2000);
	private static final BigInteger UNSUPPORTEDOPERATIONFAULT_CODE = BigInteger.valueOf(3000);
	private static final BigInteger UNKNOWNFAULT_CODE = BigInteger.valueOf(4000);

	@Override
	protected void customizeFault(Object endpoint, Exception ex, SoapFault fault) {
		if (ex instanceof MessageTooLargeException) {
			customizeFault((MessageTooLargeException) ex, fault);
		} else if (ex instanceof SecurityException) {
			customizeFault((SecurityException) ex, fault);
		} else if (ex instanceof UnsupportedOperationException) {
			customizeFault((UnsupportedOperationException) ex, fault);
		} else if (ex instanceof TransportServerException) {
			customizeFault((TransportServerException) ex, fault);
		} else {
			customizeFault(ex, fault);
		}
	}

	/**
	 * 
	 * @param e
	 * @param fault
	 */
	private void customizeFault(MessageTooLargeException e, SoapFault fault) {
		MessageTooLargeFaultType faultDocument = new MessageTooLargeFaultType();
		faultDocument.setCode(MESSAGETOOLARGEFAULT_CODE);
		faultDocument.setDetail(e.getMessage());
		faultDocument.setReason("MessageTooLarge");
		try {
			Transformer trn = TransformerFactory.newInstance().newTransformer();
			SoapFaultDetail faultDetail = fault.addFaultDetail();
			Result result = faultDetail.getResult();
			trn.transform(new StringSource(WsdlUtil.toString(faultDocument)), result);
		} catch (TransformerException ex) {
			logger.error("problem with XML transform: ", ex);
		} catch (XmlMappingException e1) {
			logger.error("problem with XML transform: ", e1);
		} catch (JAXBException e1) {
			logger.error("problem with XML transform: ", e1);
		} catch (IOException e1) {
			logger.error("problem with XML transform: ", e1);
		}
	}

	/**
	 * 
	 * @param e
	 * @param fault
	 */
	private void customizeFault(SecurityException e, SoapFault fault) {
		SecurityFaultType faultDocument = new SecurityFaultType();
		faultDocument.setCode(SECURITYFAULT_CODE);
		faultDocument.setDetail(e.getMessage());
		faultDocument.setReason("Security");
		try {
			Transformer trn = TransformerFactory.newInstance().newTransformer();
			SoapFaultDetail faultDetail = fault.addFaultDetail();
			Result result = faultDetail.getResult();
			trn.transform(new StringSource(WsdlUtil.toString(faultDocument)), result);
		} catch (TransformerException ex) {
			logger.error("problem with XML transform: ", ex);
		} catch (XmlMappingException e1) {
			logger.error("problem with XML transform: ", e1);
		} catch (JAXBException e1) {
			logger.error("problem with XML transform: ", e1);
		} catch (IOException e1) {
			logger.error("problem with XML transform: ", e1);
		}

	}

	/**
	 * 
	 * @param e
	 * @param fault
	 */
	private void customizeFault(UnsupportedOperationException e, SoapFault fault) {
		UnsupportedOperationFaultType faultDocument = new UnsupportedOperationFaultType();
		faultDocument.setCode(UNSUPPORTEDOPERATIONFAULT_CODE);
		faultDocument.setDetail(e.getMessage());
		faultDocument.setReason("UnsupportedOperation");
		try {
			Transformer trn = TransformerFactory.newInstance().newTransformer();
			SoapFaultDetail faultDetail = fault.addFaultDetail();
			Result result = faultDetail.getResult();
			trn.transform(new StringSource(WsdlUtil.toString(faultDocument)), result);
		} catch (TransformerException ex) {
			logger.error("problem with XML transform: ", ex);
		} catch (XmlMappingException e1) {
			logger.error("problem with XML transform: ", e1);
		} catch (JAXBException e1) {
			logger.error("problem with XML transform: ", e1);
		} catch (IOException e1) {
			logger.error("problem with XML transform: ", e1);
		}
	}

	/**
	 * 
	 * @param e
	 * @param fault
	 */
	private void customizeFault(Exception e, SoapFault fault) {
		SoapFaultType faultDocument = new SoapFaultType();
		faultDocument.setCode(UNKNOWNFAULT_CODE);
		faultDocument.setDetail(e.getMessage());
		faultDocument.setReason("Unknown");
		try {
			Transformer trn = TransformerFactory.newInstance().newTransformer();
			SoapFaultDetail faultDetail = fault.addFaultDetail();
			Result result = faultDetail.getResult();
			trn.transform(new StringSource(WsdlUtil.toString(faultDocument)), result);
		} catch (TransformerException ex) {
			logger.error("problem with XML transform: ", ex);
		} catch (XmlMappingException e1) {
			logger.error("problem with XML transform: ", e1);
		} catch (JAXBException e1) {
			logger.error("problem with XML transform: ", e1);
		} catch (IOException e1) {
			logger.error("problem with XML transform: ", e1);
		}
	}

	/**
	 * 
	 * @param e
	 * @param fault
	 */
	private void customizeFault(TransportServerException e, SoapFault fault) {
		SoapFaultType faultDocument = new SoapFaultType();
		faultDocument.setCode(UNKNOWNFAULT_CODE);
		faultDocument.setDetail(e.getMessage());
		faultDocument.setReason("Unknown");
		try {
			Transformer trn = TransformerFactory.newInstance().newTransformer();
			SoapFaultDetail faultDetail = fault.addFaultDetail();
			Result result = faultDetail.getResult();
			trn.transform(new StringSource(WsdlUtil.toString(faultDocument)), result);
		} catch (TransformerException ex) {
			logger.error("problem with XML transform: ", ex);
		} catch (XmlMappingException e1) {
			logger.error("problem with XML transform: ", e1);
		} catch (JAXBException e1) {
			logger.error("problem with XML transform: ", e1);
		} catch (IOException e1) {
			logger.error("problem with XML transform: ", e1);
		}
	}

}
