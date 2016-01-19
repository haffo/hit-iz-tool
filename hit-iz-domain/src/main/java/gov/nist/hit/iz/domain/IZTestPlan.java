/**
 * This software was developed at the National Institute of Standards and
 * Technology by employees of the Federal Government in the course of their
 * official duties. Pursuant to title 17 Section 105 of the United States Code
 * this software is not subject to copyright protection and is in the public
 * domain. This is an experimental system. NIST assumes no responsibility
 * whatsoever for its use by other parties, and makes no guarantees, expressed
 * or implied, about its quality, reliability, or any other characteristic. We
 * would appreciate acknowledgement if the software is used. This software can
 * be redistributed and/or modified freely provided that any derivative works
 * bear some notice that they are derived from it, and any modified versions
 * bear some notice that they have been modified.
 */

package gov.nist.hit.iz.domain;

import gov.nist.hit.core.domain.ObjectType;

import javax.persistence.Column;
import javax.persistence.MappedSuperclass;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @(#) TestPlan.java
 */
@MappedSuperclass
public class IZTestPlan implements java.io.Serializable {

	private static final long serialVersionUID = 1L;

	@NotNull
	@Column(nullable = false)
	@JsonProperty("label")
	protected String name;

	@Column(nullable = true)
	protected String description;

	protected String testProcedurePath;

	transient protected final ObjectType type = ObjectType.TestPlan;

	public IZTestPlan() {
		super();
	}

	public IZTestPlan(String name) {
		setName(name);
	}

	public IZTestPlan(IZTestPlan testPlan) {
		setName(testPlan.getName());
		setDescription(testPlan.getDescription());
	}

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
		sb.append("Name: ").append(getName()).append(", ");
		// sb.append("Description: ").append(getDescription()).append(", ");
		sb.append("Description: ").append(getDescription()).append(", ");
		// sb.append("TestCases: ")
		// .append(getTestCases() == null ? "null" : getTestCases().size())
		// .append(", ");
		return sb.toString();
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getTestProcedurePath() {
		return testProcedurePath;
	}

	public void setTestProcedurePath(String testProcedurePath) {
		this.testProcedurePath = testProcedurePath;
	}

	public ObjectType getType() {
		return type;
	}

}
