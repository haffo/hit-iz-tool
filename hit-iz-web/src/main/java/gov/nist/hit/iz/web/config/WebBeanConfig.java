/**
 * This software was developed at the National Institute of Standards and Technology by employees
 * of the Federal Government in the course of their official duties. Pursuant to title 17 Section 105 of the
 * United States Code this software is not subject to copyright protection and is in the public domain.
 * This is an experimental system. NIST assumes no responsibility whatsoever for its use by other parties,
 * and makes no guarantees, expressed or implied, about its quality, reliability, or any other characteristic.
 * We would appreciate acknowledgement if the software is used. This software can be redistributed and/or
 * modified freely provided that any derivative works bear some notice that they are derived from it, and any
 * modified versions bear some notice that they have been modified.
 */

package gov.nist.hit.iz.web.config;

import gov.nist.healthcare.tools.core.services.MessageParser;
import gov.nist.healthcare.tools.core.services.SoapMessageParser;
import gov.nist.healthcare.tools.core.services.SoapMessageValidator;
import gov.nist.healthcare.tools.core.services.SoapValidationReportGenerator;
import gov.nist.healthcare.tools.core.services.XmlMessageParser;
import gov.nist.healthcare.tools.core.services.XmlMessageParserImpl;
import gov.nist.healthcare.tools.core.services.hl7.v2.message.Er7MessageParser;
import gov.nist.healthcare.tools.core.services.hl7.v2.message.Er7MessageParserImpl;
import gov.nist.healthcare.tools.core.services.hl7.v2.message.Er7MessageValidator;
import gov.nist.healthcare.tools.core.services.hl7.v2.message.Er7MessageValidatorImpl;
import gov.nist.healthcare.tools.core.services.hl7.v2.message.Er7ValidationReportGenerator;
import gov.nist.healthcare.tools.core.services.hl7.v2.message.Er7ValidationReportGeneratorImpl;
import gov.nist.healthcare.tools.core.services.hl7.v2.soap.SoapMessageParserImpl;
import gov.nist.healthcare.tools.core.services.hl7.v2.soap.SoapValidationReportGeneratorImpl;
import gov.nist.hit.iz.service.IISReceiver;
import gov.nist.hit.iz.service.Receiver;
import gov.nist.hit.iz.service.soap.SoapMessageValidatorImpl;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;
import org.springframework.remoting.jaxws.SimpleJaxWsServiceExporter;

/**
 * @author Harold Affo (NIST)
 * 
 */

@Configuration
@ImportResource("classpath:/iztool-ws-context.xml")
public class WebBeanConfig {

	@Bean
	public MessageParser er7MessageParser() {
		return new Er7MessageParserImpl();
	}

	@Bean
	public Er7MessageValidator er7Validator() {
		return new Er7MessageValidatorImpl();
	}

	@Bean
	public SoapMessageValidator soapValidator() {
		return new SoapMessageValidatorImpl("/bundle/schema/soap_rules.sch");
	}

	// @Bean
	// public TableLibraryUnmarshaller tableLibraryUnmarshaller() {
	// return new TableLibraryUnmarshallerImpl();
	// }

	// @Bean
	// public VocabularySearchServiceImpl vocabularySearchService(
	// TableLibraryUnmarshaller tableLibraryUnmarshaller,
	// TableLibrariesRepository vocabularyCollectionRepository) {
	// return new VocabularySearchServiceImpl(tableLibraryUnmarshaller,
	// vocabularyCollectionRepository);
	// }

	@Bean
	public SoapMessageParser soapParser(XmlMessageParser xmlParser) {
		return new SoapMessageParserImpl(xmlParser);
	}

	@Bean
	public XmlMessageParser xmlParser() {
		return new XmlMessageParserImpl();
	}

	@Bean
	public Er7MessageParser er7Parser() {
		return new Er7MessageParserImpl();
	}

	@Bean
	public SoapValidationReportGenerator soapReportGenerator() {
		return new SoapValidationReportGeneratorImpl();
	}

	@Bean
	public Er7ValidationReportGenerator er7ReportGenerator() {
		return new Er7ValidationReportGeneratorImpl();
	}

	@Bean
	public SimpleJaxWsServiceExporter simpleJaxWsServiceExporter() {
		return new SimpleJaxWsServiceExporter();
	}

	@Bean
	public Receiver receiver() {
		return new IISReceiver();
	}

}
