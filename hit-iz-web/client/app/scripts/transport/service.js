
angular.module('transport').factory('Transport', function ($q, $http, StorageService, User, $timeout, $rootScope) {
        var Transport = {
            running: false,
            configs: {},
            transactions: [],
            logs: {},
            timeout: StorageService.get(StorageService.TRANSPORT_TIMEOUT) != null && StorageService.get(StorageService.TRANSPORT_TIMEOUT) != undefined ? StorageService.get(StorageService.TRANSPORT_TIMEOUT) : 120,
            disabled: StorageService.get(StorageService.TRANSPORT_DISABLED) != null ? StorageService.get(StorageService.TRANSPORT_DISABLED) : true,

            /**
             *
             * @param domain
             */
            setDisabled: function (disabled) {
                this.disabled = disabled;
            },


            setTimeout: function (timeout) {
                this.timeout = timeout;
                StorageService.set(StorageService.TRANSPORT_TIMEOUT, timeout)
            },

            getTimeout: function () {
                return this.timeout;
            },


            getDomainForms: function (domain) {
                var delay = $q.defer();
                $http.get('api/transport/forms/'+domain).then(
                    function (response) {
                        var data = angular.fromJson(response.data);
                        delay.resolve(data);
                    },
                    function (response) {
                        delay.reject(response);
                    }
                );
                return delay.promise;
            },

            // getDomainProtocols: function (domain) {
            //     var delay = $q.defer();
            //     $http.get('api/transport/protocols/'+domain).then(
            //         function (response) {
            //             var data = angular.fromJson(response.data);
            //             delay.resolve(data);
            //         },
            //         function (response) {
            //             delay.reject(response);
            //         }
            //     );
            // },



            // getAllConfigForms: function (domain) {
            //     var delay = $q.defer();
            //     $http.get('api/transport/' + domain + '/forms').then(
            //         function (response) {
            //             var data = angular.fromJson(response.data);
            //             delay.resolve(data);
            //         },
            //         function (response) {
            //             delay.reject(response);
            //         }
            //     );
            //
            //     return delay.promise;
            // },

            getConfigData: function (domain, protocol) {
                var delay = $q.defer();
                var self = this;
                if (domain != null && protocol != null && User.info && User.info != null && User.info.id != null) {
                    $http.post('api/transport/' + domain + "/" + protocol + '/configs').then(
                        function (response) {
                            delay.resolve(angular.fromJson(response.data));
                        },
                        function (response) {
                            delay.reject(response);
                        }
                    );
//
//                    $http.get('../../resources/cb/transport-config-data.json').then(
//                        function (response) {
//                            delay.resolve(angular.fromJson(response.data));
//                        },
//                        function (response) {
//                            delay.reject(response);
//                        }
//                    );
                } else {
                    delay.reject("Domain, protocol or user info not provided");
                }
                return delay.promise;
            },


            searchTransaction: function (testStepId, config, responseMessageId, domain, protocol) {
                var delay = $q.defer();
                var self = this;
                if (config != null) {
                    var data = angular.fromJson({
                        "testStepId": testStepId,
                        "userId": User.info.id,
                        "config": config,
                        "responseMessageId": responseMessageId
                    });
                    $http.post('api/transport/' + domain + "/" + protocol + '/searchTransaction', data).then(
                        function (response) {
                            if (response.data != null && response.data != "") {
                                self.transactions[testStepId] = angular.fromJson(response.data);
                            } else {
                                self.transactions[testStepId] = null;
                            }
                            delay.resolve(self.transactions[testStepId]);
                        },
                        function (response) {
                            self.transactions[testStepId] = null;
                            delay.reject(self.transactions[testStepId]);
                        }
                    );
//                    $http.get('../../resources/cb/transaction.json').then(
//                        function (response) {
//                            if (response.data != null && response.data != "") {
//                                self.transactions[testStepId] = angular.fromJson(response.data);
//                            } else {
//                                self.transactions[testStepId] = null;
//                            }
//                            delay.resolve(self.transactions[testStepId]);
//                        },
//                        function (response) {
//                            delay.reject(null);
//                        }
//                    );
                } else {
                    delay.reject("Configuration info not found");
                }

                return delay.promise;
            },

            deleteTransaction: function (testStepId) {
                var delay = $q.defer();
                var self = this;
                if (self.transactions && self.transactions != null && self.transactions[testStepId]) {
                    var transaction = self.transactions[testStepId];
                    $http.post('api/transport/transaction/' + transaction.id + '/delete').then(
                        function (response) {
                            delete self.transactions[testStepId];
                            delay.resolve(true);
                        },
                        function (response) {
                            delete self.transactions[testStepId];
                            delay.resolve(true);
                        }
                    );
                } else {
                    delay.resolve(true);
                }
                return delay.promise;
            },

            stopListener: function (testStepId, domain, protocol) {
                var self = this;
                var delay = $q.defer();
                this.deleteTransaction(testStepId).then(function (result) {
                    var data = angular.fromJson({"testStepId": testStepId});
                    $http.post('api/transport/' + domain + "/" + protocol + '/stopListener', data).then(
                        function (response) {
                            self.running = true;
                            delay.resolve(true);
                        },
                        function (response) {
                            self.running = false;
                            delay.reject(null);
                        }
                    );
                });

//
//                $http.get('../../resources/cb/stopListener.json').then(
//                    function (response) {
//                        self.running = true;
//                        self.deleteTransaction(testStepId);
//                        delay.resolve(true);
//                    },
//                    function (response) {
//                        self.running = false;
//                        delay.reject(null);
//                    }
//                );
                return delay.promise;
            },

            startListener: function (testStepId, responseMessageId, domain, protocol) {
                var delay = $q.defer();
                var self = this;
                this.deleteTransaction(testStepId).then(function (result) {
                    var data = angular.fromJson({"testStepId": testStepId, "responseMessageId": responseMessageId});
                    $http.post('api/transport/' + domain + "/" + protocol + '/startListener', data).then(
                        function (response) {
                            self.running = true;
                            delay.resolve(true);
                        },
                        function (response) {
                            self.running = false;
                            delay.reject(null);
                        }
                    );
                });

//                $http.get('../../resources/cb/startListener.json').then(
//                    function (response) {
//                        self.running = true;
//                        delay.resolve(true);
//                    },
//                    function (response) {
//                        self.running = false;
//                        delay.reject(null);
//                    }
//                );
                return delay.promise;
            },

            send: function (testStepId, message, domain, protocol) {
                var delay = $q.defer();
                var self = this;
                this.deleteTransaction(testStepId).then(function (result) {
                    var data = angular.fromJson({
                        "testStepId": testStepId,
                        "message": message,
                        "config": self.configs[protocol].data.taInitiator
                    });
                    $http.post('api/transport/' + domain + "/" + protocol + '/send', data).then(
                        function (response) {
                            self.transactions[testStepId] = angular.fromJson(response.data);
                            delay.resolve(self.transactions[testStepId]);
                        },
                        function (response) {
                            self.transactions[testStepId] = null;
                            delay.reject(response);
                        }
                    );
//                    $http.get('../../resources/cb/send.json').then(
//                        function (response) {
//                            self.transactions[testStepId] = angular.fromJson(response.data);
//                            delay.resolve(self.transactions[testStepId]);
//                        },
//                        function (response) {
//                            delay.reject(response);
//                        }
//                    );
                });
                return delay.promise;
            },

            populateMessage: function (testStepId, message, domain, protocol) {
                var delay = $q.defer();
                var self = this;
                var data = angular.fromJson({"testStepId": testStepId, "message": message});
                $http.post('api/transport/' + domain + "/" + protocol + '/populateMessage', data).then(
                    function (response) {
                        delay.resolve(angular.fromJson(response.data));
                    },
                    function (response) {
                        delay.reject(null);
                    }
                );

//                $http.get('../../resources/cb/startListener.json').then(
//                    function (response) {
//                        self.running = true;
//                        delay.resolve(true);
//                    },
//                    function (response) {
//                        self.running = false;
//                        delay.reject(null);
//                    }
//                );
                return delay.promise;
            }
            ,
            saveTransportLog: function (testStepId, content, domain, protocol) {
                var delay = $q.defer();
                var data = angular.fromJson({
                    "testStepId": testStepId,
                    "content": content,
                    "domain": domain,
                    "protocol": protocol
                });
                $http.post('api/logs/transport', data).then(
                    function (response) {
                        delay.resolve(response.data);
                    },
                    function (response) {
                        delay.reject(null);
                    }
                );
                return delay.promise;
            }
        };

        return Transport;
    }
);

