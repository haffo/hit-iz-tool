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

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.OneToMany;
import javax.persistence.OrderBy;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @(#) TestPlan.java
 */
@Entity
public class IZEnvelopeTestPlan extends IZTestPlan implements
		java.io.Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	protected Long id;

	@JsonProperty("children")
	@OrderBy("name ASC")
	@OneToMany(fetch = FetchType.EAGER, cascade = { CascadeType.PERSIST,
			CascadeType.REMOVE })
	@JoinTable(name = "soapenv_tp_tc", joinColumns = { @JoinColumn(name = "testplan_id") }, inverseJoinColumns = { @JoinColumn(name = "testcase_id") })
	protected Set<IZEnvelopeTestCase> testCases = new HashSet<IZEnvelopeTestCase>();

	public IZEnvelopeTestPlan() {
		super();
	}

	public IZEnvelopeTestPlan(String name) {
		setName(name);
	}

	public IZEnvelopeTestPlan(IZEnvelopeTestPlan testPlan) {
		setName(testPlan.getName());
		setDescription(testPlan.getDescription());
	}

	public Long getId() {
		return this.id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
		sb.append("Id: ").append(getId()).append(", ");
		sb.append("Name: ").append(getName()).append(", ");
		// sb.append("Description: ").append(getDescription()).append(", ");
		sb.append("Description: ").append(getDescription()).append(", ");
		// sb.append("TestCases: ")
		// .append(getTestCases() == null ? "null" : getTestCases().size())
		// .append(", ");
		return sb.toString();
	}

	public void addTestCase(IZEnvelopeTestCase testCase) {
		testCases.add(testCase);
		testCase.setParentName(this.name);
	}

	public Set<IZEnvelopeTestCase> getTestCases() {
		return Collections.unmodifiableSet(testCases);
	}

}
