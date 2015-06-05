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

package gov.nist.hit.iz.web.controller;

import gov.nist.healthcare.core.MalformedMessageException;
import gov.nist.healthcare.core.message.v2.er7.Er7Message;
import gov.nist.healthcare.tools.core.services.exception.MessageException;

import java.io.IOException;
import java.io.InputStream;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.multipart.MultipartFile;

/**
 * @author Harold Affo (NIST)
 * 
 */
@RequestMapping("/hl7")
@Controller
public class Er7MessageController {

	static final Logger logger = LoggerFactory
			.getLogger(Er7MessageController.class);

	@ExceptionHandler(MessageException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public String messageException(MessageException ex) {
		logger.debug(ex.getMessage());
		return ex.getMessage();
	}

	@RequestMapping(value = "/message/download", method = RequestMethod.POST, consumes = "application/x-www-form-urlencoded; charset=UTF-8")
	public String download(@RequestParam("er7Message") String er7Message,
			HttpServletRequest request, HttpServletResponse response)
			throws MessageException {
		try {
			logger.info("Downloading message");
			InputStream content = IOUtils.toInputStream(er7Message, "UTF-8");
			response.setContentType("text/plain");
			response.setHeader("Content-disposition",
					"attachment;filename=UserMessage" + new Date().getTime()
							+ ".txt");
			FileCopyUtils.copy(content, response.getOutputStream());
		} catch (IOException e) {
			logger.debug("Failed to download the message ");
			throw new MessageException("Cannot download the message "
					+ e.getMessage());
		}
		return null;
	}

	@ResponseBody
	@RequestMapping(value = "/message/upload", method = RequestMethod.POST, consumes = { "multipart/form-data" })
	public Map<String, String> upload(@RequestPart("file") MultipartFile part)
			throws MessageException {
		try {
			Map<String, String> map = new HashMap<String, String>();
			InputStream in = part.getInputStream();
			map.put("name", part.getName());
			map.put("size", part.getSize() + "");
			try {
				String content = IOUtils.toString(in);
				Er7Message message = new Er7Message(content);
				map.put("content", content);
			} catch (MalformedMessageException e) {
				map.put("content",
						"Sorry, file content is not an er7 message content");
			}
			return map;
		} catch (IOException e) {
			throw new MessageException(e);
		}
	}

}
