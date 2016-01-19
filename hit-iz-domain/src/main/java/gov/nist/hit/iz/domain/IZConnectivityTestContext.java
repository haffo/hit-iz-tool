package gov.nist.hit.iz.domain;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;

@Entity
public class IZConnectivityTestContext implements java.io.Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	protected Long id;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	@Column(columnDefinition = "LONGTEXT")
	protected String message;

	@Column(columnDefinition = "LONGTEXT")
	protected String exampleMessage;

	@Column(nullable = true)
	private String requestValidationPhase;

	@Column(nullable = true)
	private String responseValidationPhase;

	@Lob
	@Basic(fetch = FetchType.EAGER)
	@Column(length = 100000)
	protected byte[] requestContentImage;

	@Lob
	@Basic(fetch = FetchType.EAGER)
	@Column(length = 100000)
	protected byte[] responseContentImage;

	public byte[] getRequestContentImage() {
		return requestContentImage;
	}

	public void setRequestContentImage(byte[] requestContentImage) {
		this.requestContentImage = requestContentImage;
	}

	public byte[] getResponseContentImage() {
		return responseContentImage;
	}

	public void setResponseContentImage(byte[] responseContentImage) {
		this.responseContentImage = responseContentImage;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getExampleMessage() {
		return exampleMessage;
	}

	public void setExampleMessage(String exampleMessage) {
		this.exampleMessage = exampleMessage;
	}

	public String getRequestValidationPhase() {
		return requestValidationPhase;
	}

	public void setRequestValidationPhase(String requestValidationPhase) {
		this.requestValidationPhase = requestValidationPhase;
	}

	public String getResponseValidationPhase() {
		return responseValidationPhase;
	}

	public void setResponseValidationPhase(String responseValidationPhase) {
		this.responseValidationPhase = responseValidationPhase;
	}

}
