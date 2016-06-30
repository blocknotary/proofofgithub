contract GistLinkToAddress {
        address owner;
        bytes dataEmpty;
        struct GistPayment {
            string gistLink;
            uint payment;
            bytes data;
        }
        mapping(address => GistPayment) gists;
        mapping(string => address) users;
        function GistLinkToAddress() {
            owner = msg.sender;
        }
        function newGistLinkToAddr(address addr, string gistLink, string userId) {
                if (msg.sender != owner) return;
                gists[addr] = GistPayment({gistLink: gistLink, payment: 0, data: dataEmpty});
                users[userId] = addr;
        }
        function () {
            gists[msg.sender] = GistPayment({gistLink: "", payment: msg.value/100000000000000000, data: msg.data});
        }
        function sendEtherToOwner() { 
            if (msg.sender != owner) return;                 
            owner.send(this.balance);
        }
        function getGistLinkByAddress(address addr) constant returns(string) {
            return gists[addr].gistLink;
        }
        function getPaymentByAddress(address addr) constant returns(uint) {
            return gists[addr].payment;
        }
        function getPaymentDataByAddress(address addr) constant returns(bytes) {
            return gists[addr].data;
        }
        function getAddressByUserId(string userId) constant returns(address) {
            return users[userId];
        }
        function hasGistLink(address addr) constant returns(bool) {
            if (stringsEqual(gists[addr].gistLink, "")) {
                return false;
            } else {
                return true;
            }
        }
        function stringsEqual(string _a, string _b) internal returns (bool) {
            bytes memory a = bytes(_a);
            bytes memory b = bytes(_b);
            if (a.length != b.length)
                return false;
            // @todo unroll this loop
            for (uint i = 0; i < a.length; i ++)
                if (a[i] != b[i])
                    return false;
            return true;
        }
        function kill() {
            if (msg.sender != owner) return;
            selfdestruct(owner);   
        }
}