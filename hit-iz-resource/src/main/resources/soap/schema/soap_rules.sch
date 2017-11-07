<schema xmlns="http://www.ascc.net/xml/schematron" >
    <title>IHE SOAP/WSA Schematron</title>
    <ns prefix="soap" uri="http://www.w3.org/2003/05/soap-envelope"/>
    <ns prefix="ws" uri="urn:cdc:iisb:2011"/>

    <phase id='envelope'>
        <active pattern='critical_check_Envelope_element'/>
    </phase>

    <phase id='connectivityTest_Request'>
        <active pattern='critical_check_connectivityTest_Request_element'/>
    </phase>
    
    <phase id='connectivityTest_Response'>
        <active pattern='critical_check_connectivityTest_Response_element'/>
    </phase>

    <phase id='submitSingleMessage_Request'>
        <active pattern='critical_check_submitSingleMessage_Request_element'/>
    </phase>
    
    <phase id='submitSingleMessage_Response'>
        <active pattern='critical_check_submitSingleMessage_Response_element'/>
    </phase>
    
    <phase id='MessageTooLargeFault'>
        <active pattern='critical_check_MessageTooLargeFault_element'/>
    </phase>
    
    <phase id='SecurityFault'>
        <active pattern='critical_check_SecurityFault_element'/>
    </phase>
    
    <phase id='UnsupportedOperationFault'>
        <active pattern='critical_check_UnsupportedOperationFault_element'/>
    </phase>
    
    <phase id='UnknownFault'>
        <active pattern='critical_check_UnknownFault_element'/>
    </phase>
    
    <pattern name="Soap1" id="critical_check_Envelope_element">
        
        <rule context="/">
            <assert test="count(soap:Envelope) = 1">
                ERROR: SOAP1.2: The message must contain an enclosing 'Envelope' element
            </assert>
        </rule>
        
        <rule context="soap:Envelope">
            <assert test="count(soap:Body) = 1">
                ERROR: SOAP1.2: The Envelope element must contain one 'Body' element
            </assert>
        </rule>
        
    </pattern>
        
    <pattern name="Soap2_1" id="critical_check_connectivityTest_Request_element">
        
        <rule context="/">
            <assert test="count(soap:Envelope) = 1">
                ERROR: SOAP1.2: The message must contain an enclosing 'Envelope' element
            </assert>
        </rule>
        
        <rule context="soap:Envelope">
            <assert test="count(soap:Body) = 1">
                ERROR: SOAP1.2: The Envelope element must contain one 'Body' element
            </assert>
        </rule>
        
        <rule context="soap:Body">
            <assert test="count(ws:connectivityTest) = 1">
                ERROR: CDC_WSDL1.0: The Body element must contain one 'connectivityTest' element
            </assert>
        </rule>
        
        <rule context="ws:connectivityTest">
            <assert test="count(ws:echoBack) = 1">
                ERROR: CDC_WSDL1.0: The connectivityTest element must contain one 'echoBack' element
            </assert>
            <assert test="count(*) = count(ws:echoBack)">
                The only valid child element of <name/> is echoBack
            </assert>
        </rule>
        
        <!-- MDI: checks here for any child elements of an innermost element which arent defined by the spec -->
        <rule context="ws:connectivityTest/ws:echoBack">           
            <assert test="count(*) = 0">
                ERROR" The 'echoBack' element may not contain additional elements. Only text.
            </assert>
        </rule>
        
        
        <rule context="ws:connectivityTest/ws:echoBack">      
            <assert test="normalize-space(.)">
                ERROR: CDC_WSDL1.0: the required element 'echoBack' doesn't contain any data.  Data is required.
            </assert>  
        </rule>    
        
    </pattern>
    
    <pattern name="Soap2_2" id="critical_check_connectivityTest_Response_element">
        
        <rule context="/">
            <assert test="count(soap:Envelope) = 1">
                ERROR: SOAP1.2: The message must contain an enclosing 'Envelope' element
            </assert>
        </rule>
        
        <rule context="soap:Envelope">
            <assert test="count(soap:Body) = 1">
                ERROR: SOAP1.2: The Envelope element must contain one 'Body' element
            </assert>
        </rule>
        
        <rule context="soap:Body">
            <assert test="count(ws:connectivityTestResponse) = 1">
                ERROR: CDC_WSDL1.0: The Body element must contain one 'connectivityTestResponse' element
            </assert>
        </rule>
        
     
        <!-- MDI: checks here for any child elements of an innermost element which arent defined by the spec -->
        <rule context="ws:connectivityTestResponse/ws:return">           
            <assert test="count(*) = 0">
                ERROR" The 'return' element may not contain additional elements. Only text.
            </assert>
        </rule>
        
        
        <rule context="ws:connectivityTestResponse">
            <assert test="count(ws:return) = 1">
                ERROR: CDC_WSDL1.0: The connectivityTestResponse element must contain one 'return' element
            </assert>
            <assert test="count(*) = count(ws:return)">
                The only valid child element of <name/> is return
            </assert>
        </rule>
        
    </pattern>
        

    <pattern name="Soap3_1"  id="critical_check_submitSingleMessage_Request_element">
        
        <rule context="/">
            <assert test="count(soap:Envelope) = 1">
                ERROR: SOAP1.2: The message must contain an enclosing 'Envelope' element
            </assert>
        </rule>
        
        <rule context="soap:Envelope">
            <assert test="count(soap:Body) = 1">
                ERROR: SOAP1.2: The Envelope element must contain one 'Body' element
            </assert>
        </rule>
        
        <rule context="soap:Body">
            <assert test="count(ws:submitSingleMessage) = 1">
                ERROR: CDC_WSDL1.0: The Body element must contain one 'submitSingleMessage' element
            </assert>
        </rule>
        
        <rule context="ws:submitSingleMessage">
            <assert test="count(ws:hl7Message) = 1">
                ERROR: CDC_WSDL1.0: The 'submitSingleMessage' element must contain one 'hl7Message' element
            </assert>
            <assert test="count(ws:username) = 1">
                WARNING: CDC_WSDL1.0: an optional 'username' element is not contained within 'submitSingleMessage'  Note that most IIS will require a username/password.
            </assert>
            <assert test="count(ws:password) = 1">
                WARNING: CDC_WSDL1.0: an optional 'password' element is not contained within 'submitSingleMessage'  Note that most IIS will require a username/password.
            </assert>
            <assert test="count(ws:facilityID) = 1">
                WARNING: CDC_WSDL1.0: an optional 'facilityID' element is not contained within 'submitSingleMessage'  Note that most IIS will require a facilityID
            </assert>
            
            <assert test="count(*) = count(ws:username|ws:password|ws:facilityID|ws:hl7Message)">
                The only valid child elements of <name/> are username, password, facilityID, and hl7Message
            </assert>
        </rule>
        
        
        <!-- MDI: checks here for any child elements of an innermost element which arent defined by the spec -->
        <rule context="ws:submitSingleMessage/ws:hl7Message">           
            <assert test="count(*) = 0">
                ERROR" The 'hl7Message' element may not contain additional elements. Only HL7 V2 messages are permitted 
            </assert>
        </rule>
        
        <!-- MDI: checks here for any child elements of an innermost element which arent defined by the spec -->
        <rule context="ws:submitSingleMessage/ws:username">           
            <assert test="count(*) = 0">
                ERROR" The 'username' element may not contain additional elements. On a username is permitted
            </assert>
        </rule>
        
        <!-- MDI: checks here for any child elements of an innermost element which arent defined by the spec -->
        <rule context="ws:submitSingleMessage/ws:password">           
            <assert test="count(*) = 0">
                ERROR" The 'password' element may not contain additional elements. On a password is permitted
            </assert>
        </rule>
        
        <!-- MDI: checks here for any child elements of an innermost element which arent defined by the spec -->
        <rule context="ws:submitSingleMessage/ws:facilityID">           
            <assert test="count(*) = 0">
                ERROR" The 'facilityID' element may not contain additional elements. On a facility ID is permitted
            </assert>
        </rule>
        
        
        
        <rule context="ws:submitSingleMessage/ws:hl7Message">      
            <assert test="normalize-space(.)">
                ERROR: CDC_WSDL1.0: the required element 'hl7Message' doesn't contain any data.  An HL7 V2 message is required
            </assert>
            <!--
            <assert test="contains(.,'[CDATA')">
                WARNING: CDC_WSDL1.0: the required element 'hl7Message' contains data which is NOT within a CDATA block.  It is recommended that the HL7 V2 message is contained within a CDATA block
            </assert>   
            -->
        </rule>      
        
        <rule context="ws:submitSingleMessage/ws:username">      
            <assert test="normalize-space(.)">
                WARNING: CDC_WSDL1.0: the optional element 'username' doesn't contain any data. Note that most IIS will require a non-empty username.
            </assert>
        </rule>     
        <rule context="ws:submitSingleMessage/ws:password">      
            <assert test="normalize-space(.)">
                WARNING: CDC_WSDL1.0: the required element 'password' doesn't contain any data.  Note that most IIS will require a non-empty password.
            </assert>
        </rule>     
        <rule context="ws:submitSingleMessage/ws:facilityID">      
            <assert test="normalize-space(.)">
                WARNING: CDC_WSDL1.0: the required element 'facilityID' doesn't contain any data.  Note that most IIS will require a non-empty facilityID.
            </assert>
        </rule>     
    </pattern>
    
    
    <pattern name="Soap3_2"  id="critical_check_submitSingleMessage_Response_element">
        
        <rule context="/">
            <assert test="count(soap:Envelope) = 1">
                ERROR: SOAP1.2: The message must contain an enclosing 'Envelope' element
            </assert>
        </rule>
        
        <rule context="soap:Envelope">
            <assert test="count(soap:Body) = 1">
                ERROR: SOAP1.2: The Envelope element must contain one 'Body' element
            </assert>
        </rule>
        
        <rule context="soap:Body">
            <assert test="count(ws:submitSingleMessageResponse) = 1">
                ERROR: CDC_WSDL1.0: The Body element must contain one 'submitSingleMessageResponse' element
            </assert>
        </rule>
        
        <rule context="ws:submitSingleMessageResponse">
            <assert test="count(ws:return) = 1">
                ERROR: CDC_WSDL1.0: The submitSingleMessageResponse element must contain one 'return' element
            </assert>    
            
            <assert test="count(*) = count(ws:return)">
                The only valid child element of <name/> is return
            </assert>
        </rule>
        

    <!-- MDI: checks here for any child elements of an innermost element which arent defined by the spec -->
        <rule context="ws:submitSingleMessageResponse/ws:return">           
            <assert test="count(*) = 0">
                 ERROR" The 'return' element may not contain additional elements.  Only HL7 V2 messages are permitted 
            </assert>
        </rule>
        
       
        <rule context="ws:submitSingleMessageResponse/ws:return">      
            <assert test="normalize-space(.)">
                ERROR: CDC_WSDL1.0: the required element 'return' doesn't contain any data.  An HL7 V2 message is required
            </assert>
            <!--
            <assert test="contains(.,'[CDATA')">
                WARNING: CDC_WSDL1.0: the required element 'return' contains data which is NOT within a CDATA block.  It is recommended that the HL7 V2 message is contained within a CDATA block
            </assert>   
            -->
        </rule>   
        
    </pattern>
    
    <pattern name="Soap4"  id="critical_check_MessageTooLargeFault_element">
        
        <rule context="/">
            <assert test="count(soap:Envelope) = 1">
                ERROR: SOAP1.2: The message must contain an enclosing 'Envelope' element
            </assert>
        </rule>
        
        <rule context="soap:Envelope">
            <assert test="count(soap:Body) = 1">
                ERROR: SOAP1.2: The Envelope element must contain one 'Body' element
            </assert>
        </rule>
        
        <rule context="soap:Body">
            <assert test="count(soap:Fault) = 1">
                ERROR: SOAP1.2: The Body element must contain a 'Fault' element
            </assert>
            <assert test="count(*) = count(soap:Fault)">
                The only valid child element of <name/> is Fault
            </assert>
        </rule>
        
        <rule context="soap:Body/soap:Fault">
            <assert test="count(soap:Code) = 1">
                ERROR: CDC_WSDL1.0: The Fault element must contain one child element named 'Code'
            </assert>    
            <assert test="count(soap:Reason) = 1">
                ERROR: CDC_WSDL1.0: The Fault element must contain one child element named 'Reason'
            </assert> 
            <assert test="count(soap:Detail) = 1">
                ERROR: CDC_WSDL1.0: The Fault element must contain one child element named 'Detail'
            </assert> 
            
            <assert test="count(*) = count(soap:Code|soap:Reason|soap:Detail|soap:Node|soap:Role)">
                The only valid child elements of <name/> are Code, Reason, Detail, Node, and Role
            </assert>
        </rule>
        
        <rule context="soap:Body/soap:Fault/soap:Code">
            <assert test="count(soap:Value) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Code element must contain one child element named 'Value'
            </assert>    
        </rule>
        
        <!--
        <rule context="soap:Body/soap:Fault/soap:Code/soap:Value">
            <assert test="normalize-space(.)">
                ERROR: CDC_WSDL1.0: the Code/Value element doesn't contain any data.  A value of 'Sender' or 'Receiver' is required.
            </assert>
            <assert test="string(.)='Sender' or string(.)='Receiver'">
                WARNING: CDC_WSDL1.0: the Code/Value element must contain a value of 'Sender' or 'Receiver' 
            </assert>   
        </rule>
        -->
        
           
        <rule context="soap:Body/soap:Fault/soap:Reason">
            <assert test="count(soap:Text) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Reason element must contain one child element named 'Text'
            </assert>    
        </rule>
      
        <rule context="soap:Body/soap:Fault/soap:Detail">
            <assert test="count(ws:MessageTooLargeFault) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Detail element must contain one child element named 'MessageTooLargeFault'
            </assert>    
        </rule>
        
        <rule context="soap:Body/soap:Fault/soap:Detail/ws:MessageTooLargeFault">
            <assert test="count(ws:Code) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Detail/MessageTooLargeFault element must contain one child element named 'Code'
            </assert>    
            <assert test="count(ws:Reason) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Detail/MessageTooLargeFault element must contain one child element named 'Reason'
            </assert>    
            <assert test="count(ws:Detail) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Detail/MessageTooLargeFault element must contain one child element named 'Detail'
            </assert>   
            
            <assert test="count(*) = count(ws:Code|ws:Reason|ws:Detail)">
                The only valid child elements of <name/> are Code, Reason, Detail
            </assert>
        </rule>     
        
        <rule context="soap:Body/soap:Fault/soap:Detail/ws:MessageTooLargeFault/ws:Code">
            <!--
            <assert test="normalize-space(.)">
                ERROR: CDC_WSDL1.0: the MessageTooLargeFault/Code element doesn't contain any data.  An integer value is required.
            </assert>
            <assert test="number(.) = .">
                ERROR: CDC_WSDL1.0: the MessageTooLargeFault/Code element value is not an integer.  An integer vaue is required.
            </assert>
            -->
            
            <assert test="string(number(.)) != 'NaN'">
                ERROR: CDC_WSDL1.0: the MessageTooLargeFault/Code element value is not an integer.  An integer vaue is required.
            </assert>
            
            <!-- MDI: checks here for any child elements of an innermost element which arent defined by the spec -->
            <assert test="count(*) = 0">
                ERROR" The 'Code' element may not contain additional elements.  Only a code value is permitted
            </assert>
        </rule>
        
        
        <!-- MDI: checks here for any child elements of an innermost element which arent defined by the spec -->
        <rule context="soap:Body/soap:Fault/soap:Detail/ws:MessageTooLargeFault/ws:Detail">           
            <assert test="count(*) = 0">
                ERROR" The 'Detail' element may not contain additional elements.  Only Detail text is permitted
            </assert>
        </rule>
        
        
        <rule context="soap:Body/soap:Fault/soap:Detail/ws:MessageTooLargeFault/ws:Reason">
            <assert test="normalize-space(.)">
                ERROR: CDC_WSDL1.0: the MessageTooLargeFault/Reason element doesn't contain any data.  A fixed value of 'MessageTooLarge' is required.
            </assert>
            <assert test="string(.)='MessageTooLarge'">
                WARNING: CDC_WSDL1.0: the MessageTooLargeFault/Reason element must contain a fixed value of 'MessageTooLarge' 
            </assert>   
        </rule>
        

             
    </pattern>
    
    
    <pattern name="Soap5"  id="critical_check_SecurityFault_element">
        
        <rule context="/">
            <assert test="count(soap:Envelope) = 1">
                ERROR: SOAP1.2: The message must contain an enclosing 'Envelope' element
            </assert>
        </rule>
        
        <rule context="soap:Envelope">
            <assert test="count(soap:Body) = 1">
                ERROR: SOAP1.2: The Envelope element must contain one 'Body' element
            </assert>
        </rule>
        
        <rule context="soap:Body">
            <assert test="count(soap:Fault) = 1">
                ERROR: SOAP1.2: The Body element must contain a 'Fault' element
            </assert>
            <assert test="count(*) = count(soap:Fault)">
                The only valid child element of <name/> is Fault
            </assert>
        </rule>
        
        <rule context="soap:Body/soap:Fault">
            <assert test="count(soap:Code) = 1">
                ERROR: CDC_WSDL1.0: The Fault element must contain one child element named 'Code'
            </assert>    
            <assert test="count(soap:Reason) = 1">
                ERROR: CDC_WSDL1.0: The Fault element must contain one child element named 'Reason'
            </assert> 
            <assert test="count(soap:Detail) = 1">
                ERROR: CDC_WSDL1.0: The Fault element must contain one child element named 'Detail'
            </assert> 
            
            <assert test="count(*) = count(soap:Code|soap:Reason|soap:Detail|soap:Node|soap:Role)">
                The only valid child elements of <name/> are Code, Reason, Detail, Node, and Role
            </assert>
        </rule>
        
        <rule context="soap:Body/soap:Fault/soap:Code">
            <assert test="count(soap:Value) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Code element must contain one child element named 'Value'
            </assert>    
        </rule>
        
        <!--
        <rule context="soap:Body/soap:Fault/soap:Code/soap:Value">
            <assert test="normalize-space(.)">
                ERROR: CDC_WSDL1.0: the Code/Value element doesn't contain any data.  A value of 'Sender' or 'Receiver' is required.
            </assert>
            <assert test="string(.)='Sender' or string(.)='Receiver'">
                WARNING: CDC_WSDL1.0: the Code/Value element must contain a value of 'Sender' or 'Receiver' 
            </assert>   
        </rule>
        -->
        
        <rule context="soap:Body/soap:Fault/soap:Reason">
            <assert test="count(soap:Text) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Reason element must contain one child element named 'Text'
            </assert>    
        </rule>
        
        
        <rule context="soap:Body/soap:Fault/soap:Detail">
            <assert test="count(ws:SecurityFault) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Detail element must contain one child element named 'SecurityFault'
            </assert>    
        </rule>
        
        <rule context="soap:Body/soap:Fault/soap:Detail/ws:SecurityFault">
            <assert test="count(ws:Code) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Detail/SecurityFault element must contain one child element named 'Code'
            </assert>    
            <assert test="count(ws:Reason) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Detail/SecurityFault element must contain one child element named 'Reason'
            </assert>    
            <assert test="count(ws:Detail) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Detail/SecurityFault element must contain one child element named 'Detail'
            </assert>    
            
            <assert test="count(*) = count(ws:Code|ws:Reason|ws:Detail)">
                The only valid child elements of <name/> are Code, Reason, Detail
            </assert>
        </rule>
        
        
        <!-- MDI: checks here for any child elements of an innermost element which arent defined by the spec -->
        <rule context="soap:Body/soap:Fault/soap:Detail/ws:SecurityFault/ws:Code">           
            <assert test="count(*) = 0">
                ERROR" The 'Code' element may not contain additional elements.  Only a code value is permitted
            </assert>
        </rule>
        <!-- MDI: checks here for any child elements of an innermost element which arent defined by the spec -->
        <rule context="soap:Body/soap:Fault/soap:Detail/ws:SecurityFault/ws:Detail">           
            <assert test="count(*) = 0">
                ERROR" The 'Detail' element may not contain additional elements.  Only Detail text is permitted
            </assert>
        </rule>
        
        <rule context="soap:Body/soap:Fault/soap:Detail/ws:SecurityFault/ws:Code">
            <!--
            <assert test="normalize-space(.)">
                ERROR: CDC_WSDL1.0: the SecurityFault/Code element doesn't contain any data.  An integer value is required.
            </assert>
            <assert test="number(.) = .">
                ERROR: CDC_WSDL1.0: the SecurityFault/Code element value is not an integer.  An integer vaue is required.
            </assert>
            -->
            
            <!-- 
            <assert test="normalize-space(.) and number(.) = .">
                ERROR: CDC_WSDL1.0: the SecurityFault/Code element value is not an integer.  An integer vaue is required.
            </assert>
            -->
            
            <assert test="string(number(.)) != 'NaN'">
                ERROR: CDC_WSDL1.0: the SecurityFault/Code element value is not an integer.  An integer vaue is required.
            </assert>
            
        </rule>
        
        <rule context="soap:Body/soap:Fault/soap:Detail/ws:SecurityFault/ws:Reason">
            <assert test="normalize-space(.)">
                ERROR: CDC_WSDL1.0: the SecurityFault/Reason element doesn't contain any data.  A fixed value of 'Security' is required.
            </assert>
            <assert test="string(.)='Security'">
                WARNING: CDC_WSDL1.0: the SecurityFault/Reason element must contain a fixed value of 'Security' 
            </assert>   
        </rule>
        
    </pattern>
    
    <pattern name="Soap6"  id="critical_check_UnsupportedOperationFault_element">
        
        <rule context="/">
            <assert test="count(soap:Envelope) = 1">
                ERROR: SOAP1.2: The message must contain an enclosing 'Envelope' element
            </assert>
        </rule>
        
        <rule context="soap:Envelope">
            <assert test="count(soap:Body) = 1">
                ERROR: SOAP1.2: The Envelope element must contain one 'Body' element
            </assert>
        </rule>
        
        <rule context="soap:Body">
            <assert test="count(soap:Fault) = 1">
                ERROR: SOAP1.2: The Body element must contain a 'Fault' element
            </assert>
            <assert test="count(*) = count(soap:Fault)">
                The only valid child element of <name/> is Fault
            </assert>
        </rule>
        
        <rule context="soap:Body/soap:Fault">
            <assert test="count(soap:Code) = 1">
                ERROR: CDC_WSDL1.0: The Fault element must contain one child element named 'Code'
            </assert>    
            <assert test="count(soap:Reason) = 1">
                ERROR: CDC_WSDL1.0: The Fault element must contain one child element named 'Reason'
            </assert> 
            <assert test="count(soap:Detail) = 1">
                ERROR: CDC_WSDL1.0: The Fault element must contain one child element named 'Detail'
            </assert> 
            
            <assert test="count(*) = count(soap:Code|soap:Reason|soap:Detail|soap:Node|soap:Role)">
                The only valid child elements of <name/> are Code, Reason, Detail, Node, and Role
            </assert>
        </rule>
        
        <rule context="soap:Body/soap:Fault/soap:Code">
            <assert test="count(soap:Value) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Code element must contain one child element named 'Value'
            </assert>    
        </rule>
        
        <!--
        <rule context="soap:Body/soap:Fault/soap:Code/soap:Value">
            <assert test="normalize-space(.)">
                ERROR: CDC_WSDL1.0: the Code/Value element doesn't contain any data.  A value of 'Sender' or 'Receiver' is required.
            </assert>
            <assert test="string(.)='Sender' or string(.)='Receiver'">
                WARNING: CDC_WSDL1.0: the Code/Value element must contain a value of 'Sender' or 'Receiver' 
            </assert>   
        </rule>
        -->
        
        <rule context="soap:Body/soap:Fault/soap:Reason">
            <assert test="count(soap:Text) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Reason element must contain one child element named 'Text'
            </assert>    
        </rule>
        
        <rule context="soap:Body/soap:Fault/soap:Detail">
            <assert test="count(ws:UnsupportedOperationFault) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Detail element must contain one child element named 'UnsupportedOperationFault'
            </assert>    
        </rule>
        
        <rule context="soap:Body/soap:Fault/soap:Detail/ws:UnsupportedOperationFault">
            <assert test="count(ws:Code) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Detail/UnsupportedOperationFault element must contain one child element named 'Code'
            </assert>    
            <assert test="count(ws:Reason) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Detail/UnsupportedOperationFault element must contain one child element named 'Reason'
            </assert>    
            <assert test="count(ws:Detail) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Detail/UnsupportedOperationFault element must contain one child element named 'Detail'
            </assert>    
            
            <assert test="count(*) = count(ws:Code|ws:Reason|ws:Detail)">
                The only valid child elements of <name/> are Code, Reason, Detail
            </assert>
        </rule>
        
        <rule context="soap:Body/soap:Fault/soap:Detail/ws:UnsupportedOperationFault/ws:Code">
            <!--
            <assert test="normalize-space(.)">
                ERROR: CDC_WSDL1.0: the UnsupportedOperationFault/Code element doesn't contain any data.  An integer value is required.
            </assert>
            <assert test="number(.) = .">
                ERROR: CDC_WSDL1.0: the UnsupportedOperationFault/Code element value is not an integer.  An integer vaue is required.
            </assert>
            -->
            
            <assert test="string(number(.)) != 'NaN'">
                ERROR: CDC_WSDL1.0: the UnsupportedOperationFault/Code element value is not an integer.  An integer vaue is required.
            </assert>
            
            <!-- MDI: checks here for any child elements of an innermost element which arent defined by the spec -->
            <assert test="count(*) = 0">
                ERROR" The 'Code' element may not contain additional elements.  Only a code value is permitted
            </assert>
        </rule>
        
        <!-- MDI: checks here for any child elements of an innermost element which arent defined by the spec -->
        <rule context="soap:Body/soap:Fault/soap:Detail/ws:UnsupportedOperationFault/ws:Detail">           
            <assert test="count(*) = 0">
                ERROR" The 'Detail' element may not contain additional elements.  Only Detail text is permitted
            </assert>
        </rule>
        
        <rule context="soap:Body/soap:Fault/soap:Detail/ws:UnsupportedOperationFault/ws:Reason">
            <assert test="normalize-space(.)">
                ERROR: CDC_WSDL1.0: the UnsupportedOperationFault/Reason element doesn't contain any data.  A fixed value of 'UnsupportedOperation' is required.
            </assert>
            <assert test="string(.)='UnsupportedOperation'">
                WARNING: CDC_WSDL1.0: the UnsupportedOperationFault/Reason element must contain a fixed value of 'UnsupportedOperation' 
            </assert>   
        </rule>
        
    </pattern>
    
    
    <pattern name="Soap7"  id="critical_check_UnknownFault_element">
        
        <rule context="/">
            <assert test="count(soap:Envelope) = 1">
                ERROR: SOAP1.2: The message must contain an enclosing 'Envelope' element
            </assert>
        </rule>
        
        <rule context="soap:Envelope">
            <assert test="count(soap:Body) = 1">
                ERROR: SOAP1.2: The Envelope element must contain one 'Body' element
            </assert>
        </rule>
        
        <rule context="soap:Body">
            <assert test="count(soap:Fault) = 1">
                ERROR: SOAP1.2: The Body element must contain a 'Fault' element
            </assert>
            <assert test="count(*) = count(soap:Fault)">
                The only valid child element of <name/> is Fault
            </assert>
        </rule>
        
        <rule context="soap:Body/soap:Fault">
            <assert test="count(soap:Code) = 1">
                ERROR: CDC_WSDL1.0: The Fault element must contain one child element named 'Code'
            </assert>    
            <assert test="count(soap:Reason) = 1">
                ERROR: CDC_WSDL1.0: The Fault element must contain one child element named 'Reason'
            </assert> 
            <assert test="count(soap:Detail) = 1">
                ERROR: CDC_WSDL1.0: The Fault element must contain one child element named 'Detail'
            </assert> 
            
            <assert test="count(*) = count(soap:Code|soap:Reason|soap:Detail|soap:Node|soap:Role)">
                The only valid child elements of <name/> are Code, Reason, Detail, Node, and Role
            </assert>
        </rule>
        
        <rule context="soap:Body/soap:Fault/soap:Code">
            <assert test="count(soap:Value) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Code element must contain one child element named 'Value'
            </assert>    
        </rule>
        
        <!--
        <rule context="soap:Body/soap:Fault/soap:Code/soap:Value">
            <assert test="normalize-space(.)">
                ERROR: CDC_WSDL1.0: the Code/Value element doesn't contain any data.  A value of 'Sender' or 'Receiver' is required.
            </assert>
            <assert test="string(.)='Sender' or string(.)='Receiver'">
                WARNING: CDC_WSDL1.0: the Code/Value element must contain a value of 'Sender' or 'Receiver' 
            </assert>   
        </rule>
        -->
        
        <rule context="soap:Body/soap:Fault/soap:Reason">
            <assert test="count(soap:Text) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Reason element must contain one child element named 'Text'
            </assert>    
        </rule>
        
        <rule context="soap:Body/soap:Fault/soap:Detail">
            <assert test="count(ws:fault) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Detail element must contain one child element named 'fault'
            </assert>    
        </rule>
        
        <rule context="soap:Body/soap:Fault/soap:Detail/ws:fault">
            <assert test="count(ws:Code) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Detail/fault element must contain one child element named 'Code'
            </assert>    
            <assert test="count(ws:Reason) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Detail/fault element must contain one child element named 'Reason'
            </assert>    
            <assert test="count(ws:Detail) = 1">
                ERROR: CDC_WSDL1.0: The Fault/Detail/fault element must contain one child element named 'Detail'
            </assert>    
            
            <assert test="count(*) = count(ws:Code|ws:Reason|ws:Detail)">
                The only valid child elements of <name/> are Code, Reason, Detail
            </assert>
        </rule>
        
        
        <rule context="soap:Body/soap:Fault/soap:Detail/ws:fault/ws:Code">
            <!--
            <assert test="normalize-space(.)">
                ERROR: CDC_WSDL1.0: the UnsupportedOperationFault/Code element doesn't contain any data.  An integer value is required.
            </assert>
            <assert test="number(.) = .">
                ERROR: CDC_WSDL1.0: the UnsupportedOperationFault/Code element value is not an integer.  An integer vaue is required.
            </assert>
            -->
            
            <assert test="string(number(.)) != 'NaN'">
                ERROR: CDC_WSDL1.0: the fault/Code element value is not an integer.  An integer vaue is required.
            </assert>
            
            <!-- MDI: checks here for any child elements of an innermost element which arent defined by the spec -->
            <assert test="count(*) = 0">
                ERROR" The 'Code' element may not contain additional elements.  Only a code value is permitted
            </assert>
        </rule>
        
        <!-- MDI: checks here for any child elements of an innermost element which arent defined by the spec -->
        <rule context="soap:Body/soap:Fault/soap:Detail/ws:fault/ws:Detail">           
            <assert test="count(*) = 0">
                ERROR" The 'Detail' element may not contain additional elements.  Only Detail text is permitted
            </assert>
        </rule>
        
        
    </pattern>
     
</schema>
