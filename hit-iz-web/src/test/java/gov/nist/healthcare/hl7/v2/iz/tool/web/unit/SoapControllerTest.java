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
package gov.nist.healthcare.hl7.v2.iz.tool.web.unit;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;
import gov.nist.hit.iz.web.controller.EnvelopeController;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

/**
 * @author Harold Affo
 * 
 */
public class SoapControllerTest {

	@InjectMocks
	EnvelopeController controller;

	MockMvc mockMvc;

	@Rule
	public ExpectedException thrown = ExpectedException.none();

	@Before
	public void setup() {
		MockitoAnnotations.initMocks(this);
		mockMvc = standaloneSetup(controller).build();
	}

	@Test
	public void testUpload() throws Exception {
		String soap = "Soap Envelop";
		MockMultipartFile firstFile = new MockMultipartFile("file",
				"filename.txt", "multipart/form-data", soap.getBytes());
		mockMvc.perform(
				MockMvcRequestBuilders.fileUpload("/soap/upload").file(
						firstFile)).andExpect(status().is(200))
				.andExpect(content().contentType(MediaType.APPLICATION_JSON));
	}

	@Test
	public void testValidateEnvelop() throws Exception {
		// TODO:
	}
}
