package gov.nist.hit.iz.service.soap;

import java.io.IOException;
import java.util.ArrayList;

import org.apache.http.Header;
import org.apache.http.HttpException;
import org.apache.http.HttpRequest;
import org.apache.http.HttpRequestFactory;
import org.apache.http.HttpResponse;
import org.apache.http.HttpResponseFactory;
import org.apache.http.ProtocolVersion;
import org.apache.http.impl.DefaultHttpRequestFactory;
import org.apache.http.impl.DefaultHttpResponseFactory;
import org.apache.http.impl.nio.codecs.DefaultHttpRequestParser;
import org.apache.http.impl.nio.codecs.DefaultHttpResponseParser;
import org.apache.http.impl.nio.reactor.SessionInputBufferImpl;
import org.apache.http.message.BasicLineParser;
import org.apache.http.message.LineParser;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpParams;

import gov.nist.healthcare.unified.validation.AssertionResultConstants;
import gov.nist.healthcare.unified.validation.AssertionTypeV3Constants;
import gov.nist.healthcare.unified.validation.ErrorSeverityConstants;
import gov.nist.hit.iz.domain.MessageFailureV3;

public class HTTPValidator {

	public ArrayList<MessageFailureV3> validate(String httpHeader) {
		ArrayList<MessageFailureV3> httpFailures = new ArrayList<MessageFailureV3>();

		try {
			/* Get a String channel */
			StringReaderChannel channel = new StringReaderChannel(httpHeader);
			HttpParams params = new BasicHttpParams();
			SessionInputBufferImpl buffer = new SessionInputBufferImpl(1024, 128, params);
			LineParser parser = new BasicLineParser();

			if (httpHeader.startsWith("GET") || httpHeader.startsWith("POST") || httpHeader.startsWith("PUT")
					|| httpHeader.startsWith("HEAD") || httpHeader.startsWith("OPTIONS")
					|| httpHeader.startsWith("DELETE") || httpHeader.startsWith("TRACE")
					|| httpHeader.startsWith("CONNECT")) {
				HttpRequestFactory requestFactory = new DefaultHttpRequestFactory();
				DefaultHttpRequestParser requestParser = new DefaultHttpRequestParser(buffer, parser, requestFactory,
						params);
				requestParser.fillBuffer(channel);
				HttpRequest request = requestParser.parse();
				httpFailures.addAll(validate(request));

			} else {
				HttpResponseFactory responseFactory = new DefaultHttpResponseFactory();
				DefaultHttpResponseParser responseParser = new DefaultHttpResponseParser(buffer, parser,
						responseFactory, params);
				responseParser.fillBuffer(channel);
				HttpResponse response = responseParser.parse();
				validate(response);
				httpFailures.addAll(validate(response));
			}

		} catch (IOException e) {
			// e.printStackTrace();
			MessageFailureV3 mf = new MessageFailureV3();
			mf.setFailureType(AssertionTypeV3Constants.HTTP.toString());
			mf.setFailureSeverity(ErrorSeverityConstants.FATAL.toString());
			mf.setAssertionResult(AssertionResultConstants.ERROR.toString());
			mf.setDescription("Cannot parse HTTP header. " + e.getMessage());
			httpFailures.add(mf);
		} catch (HttpException e) {
			// e.printStackTrace();
			MessageFailureV3 mf = new MessageFailureV3();
			mf.setFailureType(AssertionTypeV3Constants.HTTP.toString());
			mf.setFailureSeverity(ErrorSeverityConstants.FATAL.toString());
			mf.setAssertionResult(AssertionResultConstants.ERROR.toString());
			mf.setDescription("Cannot parse HTTP header. " + e.getMessage());
			httpFailures.add(mf);
		}
		return httpFailures;
	}

	private ArrayList<MessageFailureV3> validate(HttpResponse response) {
		ArrayList<MessageFailureV3> httpFailures = new ArrayList<MessageFailureV3>();
		/* validate protocol version */
		ProtocolVersion protocolVersion = response.getProtocolVersion();
		httpFailures.addAll(validateProtocol(protocolVersion));
		/* validate headers */
		Header[] h = response.getHeaders("Content-Type");
		if (h.length == 0) {
			MessageFailureV3 mf = new MessageFailureV3();
			mf.setFailureType(AssertionTypeV3Constants.HTTP.toString());
			mf.setFailureSeverity(ErrorSeverityConstants.NORMAL.toString());
			mf.setAssertionResult(AssertionResultConstants.ERROR.toString());

			mf.setDescription("Missing Content-Type header");
			httpFailures.add(mf);
		}
		h = response.getHeaders("Content-Length");
		if (h.length == 0) {
			MessageFailureV3 mf = new MessageFailureV3();
			mf.setFailureType(AssertionTypeV3Constants.HTTP.toString());
			mf.setFailureSeverity(ErrorSeverityConstants.NORMAL.toString());
			mf.setAssertionResult(AssertionResultConstants.ERROR.toString());

			mf.setDescription("Missing Content-Length header");
			httpFailures.add(mf);
		}
		return httpFailures;
	}

	private ArrayList<MessageFailureV3> validate(HttpRequest request) {
		ArrayList<MessageFailureV3> httpFailures = new ArrayList<MessageFailureV3>();
		/* validate protocol version */
		ProtocolVersion protocolVersion = request.getProtocolVersion();
		httpFailures.addAll(validateProtocol(protocolVersion));
		/* validate headers */

		Header[] h = request.getHeaders("Content-Type");
		if (h.length == 0) {
			MessageFailureV3 mf = new MessageFailureV3();
			mf.setFailureType(AssertionTypeV3Constants.HTTP.toString());
			mf.setFailureSeverity(ErrorSeverityConstants.NORMAL.toString());
			mf.setAssertionResult(AssertionResultConstants.ERROR.toString());

			mf.setDescription("Missing Content-Type header");
			httpFailures.add(mf);
		}
		h = request.getHeaders("Content-Length");
		if (h.length == 0) {
			gov.nist.hit.iz.domain.MessageFailureV3 mf = new MessageFailureV3();
			mf.setFailureType(AssertionTypeV3Constants.HTTP.toString());
			mf.setFailureSeverity(ErrorSeverityConstants.NORMAL.toString());
			mf.setAssertionResult(AssertionResultConstants.ERROR.toString());
			mf.setDescription("Missing Content-Length header");
			httpFailures.add(mf);
		}

		return httpFailures;
	}

	private ArrayList<MessageFailureV3> validateProtocol(ProtocolVersion protocolVersion) {
		ArrayList<MessageFailureV3> httpFailures = new ArrayList<MessageFailureV3>();
		if (protocolVersion != org.apache.http.HttpVersion.HTTP_1_1
				|| protocolVersion != org.apache.http.HttpVersion.HTTP_1_1) {

			MessageFailureV3 mf = new MessageFailureV3();
			mf.setFailureType(AssertionTypeV3Constants.HTTP.toString());
			mf.setFailureSeverity(ErrorSeverityConstants.FATAL.toString());
			mf.setAssertionResult(AssertionResultConstants.ERROR.toString());
			mf.setDescription("Invalid HTTP protocol version. According to WS Basic Profile 1.1, R1141: A"
					+ " MESSAGE MUST be sent using either HTTP/1.1 or HTTP/1.0.\n" + "Version detected: "
					+ protocolVersion);
			httpFailures.add(mf);
		}
		return httpFailures;
	}

}
