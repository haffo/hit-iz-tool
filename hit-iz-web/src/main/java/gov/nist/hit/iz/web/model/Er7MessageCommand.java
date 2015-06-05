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

package gov.nist.hit.iz.web.model;

/**
 * @author Harold Affo(NIST)
 * 
 */
public class Er7MessageCommand extends TestCaseCommand {

	private Long testCaseId;

	private String er7Message;

	private String name;

	private String facilityId;

	public String getEr7Message() {
		return er7Message;
	}

	public void setEr7Message(String er7Message) {
		this.er7Message = er7Message;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Override
	public Long getTestCaseId() {
		return testCaseId;
	}

	@Override
	public void setTestCaseId(Long testCaseId) {
		this.testCaseId = testCaseId;
	}

	public String getFacilityId() {
		return facilityId;
	}

	public void setFacilityId(String facilityId) {
		this.facilityId = facilityId;
	}

	@Override
	public String toString() {
		return "MessageModelRequest [testCaseId=" + testCaseId
				+ ", er7Message=" + er7Message + "]";
	}

}
