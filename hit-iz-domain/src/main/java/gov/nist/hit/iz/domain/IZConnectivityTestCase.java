/**
 * This software was developed at the National Institute of Standards and Technology by employees of
 * the Federal Government in the course of their official duties. Pursuant to title 17 Section 105
 * of the United States Code this software is not subject to copyright protection and is in the
 * public domain. This is an experimental system. NIST assumes no responsibility whatsoever for its
 * use by other parties, and makes no guarantees, expressed or implied, about its quality,
 * reliability, or any other characteristic. We would appreciate acknowledgement if the software is
 * used. This software can be redistributed and/or modified freely provided that any derivative
 * works bear some notice that they are derived from it, and any modified versions bear some notice
 * that they have been modified.
 */

package gov.nist.hit.iz.domain;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToOne;

/**
 * 
 * @author Harold Affo
 * 
 */
@Entity
public class IZConnectivityTestCase extends IZTestCase implements java.io.Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  protected Long id;

  @OneToOne(cascade = CascadeType.ALL, optional = false, fetch = FetchType.EAGER)
  protected IZConnectivityTestContext testContext;

  public IZConnectivityTestCase() {
    super();
    testStory = new IZTestStory();
  }

  public IZConnectivityTestCase(String name) {
    setName(name);
  }

  public Long getId() {
    return this.id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public IZConnectivityTestContext getTestContext() {
    return testContext;
  }

  public void setTestContext(IZConnectivityTestContext testContext) {
    this.testContext = testContext;
  }

}
