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

import gov.nist.hit.core.domain.User;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;

import org.apache.commons.lang3.StringUtils;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class SecurityFaultCredentials implements java.io.Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  protected Long id;

  @Column(nullable = false, unique = true)
  protected String faultUsername;

  @JsonIgnore
  @Column(nullable = false)
  protected String faultPassword;

  @JsonIgnore
  @OneToOne(optional = false, fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
  @JoinColumn(unique = true)
  protected User user;

  public String getFaultUsername() {
    return faultUsername;
  }

  public void setFaultUsername(String faultUsername) {
    this.faultUsername = faultUsername;
  }

  public String getFaultPassword() {
    return faultPassword;
  }

  public void setFaultPassword(String faultPassword) {
    this.faultPassword = faultPassword;
  }

  public boolean isEmpty() {
    return StringUtils.isEmpty(faultUsername) || StringUtils.isEmpty(faultPassword);
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

}
