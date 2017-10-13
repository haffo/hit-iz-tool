/*
 * NIST Healthcare Core
 * MessageFailureV3.java Aug 19, 2009
 *
 * This code was produced by the National Institute of Standards and
 * Technology (NIST). See the "nist.disclaimer" file given in the distribution
 * for information on the use and redistribution of this software.
 */
package gov.nist.hit.iz.domain;

/**
 * This class represents a failure when validating a V3 message.
 * 
 */
public class MessageFailureV3 {

	protected String description;
	protected int column;
	protected int line;
	protected String path;
	protected String failureSeverity;
	protected String elementContent;
	protected String assertionDeclaration;
	protected String userComment;
	protected String assertionResult;
	protected String failureType;

	// /**
	// * Get the Location for the Report
	// *
	// * @return a Location object
	// */
	// public Location getLocationForReport() {
	// Location location = Location.Factory.newInstance();
	// if (line != -1) {
	// location.setLine(line);
	// }
	// if (column != -1) {
	// location.setColumn(column);
	// }
	// if (path != null) {
	// location.setXPath(path);
	// }
	//
	// return location;
	// }

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public int getColumn() {
		return column;
	}

	public void setColumn(int column) {
		this.column = column;
	}

	public int getLine() {
		return line;
	}

	public void setLine(int line) {
		this.line = line;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public String getElementContent() {
		return elementContent;
	}

	public void setElementContent(String elementContent) {
		this.elementContent = elementContent;
	}

	public String getAssertionDeclaration() {
		return assertionDeclaration;
	}

	public void setAssertionDeclaration(String assertionDeclaration) {
		this.assertionDeclaration = assertionDeclaration;
	}

	public String getUserComment() {
		return userComment;
	}

	public void setUserComment(String userComment) {
		this.userComment = userComment;
	}

	public String getFailureSeverity() {
		return failureSeverity;
	}

	public void setFailureSeverity(String failureSeverity) {
		this.failureSeverity = failureSeverity;
	}

	public String getAssertionResult() {
		return assertionResult;
	}

	public void setAssertionResult(String assertionResult) {
		this.assertionResult = assertionResult;
	}

	public String getFailureType() {
		return failureType;
	}

	public void setFailureType(String failureType) {
		this.failureType = failureType;
	}

	@Override
	public String toString() {
		return "MessageFailureV3 [description=" + description + ", column=" + column + ", line=" + line + ", path="
				+ path + ", failureSeverity=" + failureSeverity + ", elementContent=" + elementContent
				+ ", assertionDeclaration=" + assertionDeclaration + ", userComment=" + userComment
				+ ", assertionResult=" + assertionResult + ", failureType=" + failureType + "]";
	}

}
