# Traffic Interceptor - Mermaid Architecture Diagram

## System Architecture Overview

This Mermaid diagram represents the hierarchical architecture of the Traffic Interceptor SaaS Platform.

```mermaid
graph TB
    %% Styling
    classDef frontend fill:#E3F2FD,stroke:#1976D2,stroke-width:2px,color:#0D47A1
    classDef backend fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px,color:#4A148C
    classDef data fill:#E8F5E8,stroke:#388E3C,stroke-width:2px,color:#1B5E20
    classDef external fill:#FFF3E0,stroke:#F57C00,stroke-width:2px,color:#E65100

    %% Frontend Layer
    subgraph Frontend ["🎨 Frontend Layer"]
        subgraph Dashboard ["📊 Core Dashboard"]
            DashboardMain["Dashboard Overview"]
            AnalyticsMain["Analytics Dashboard"]
            TabNav["6-Tab Navigation"]
            Charts["Advanced Charts"]
        end
        
        subgraph DomainFrontend ["🌐 Domain Management"]
            DomainMain["Domain Dashboard"]
            DomainOps["Domain Operations"]
            DomainMonitoring["Domain Monitoring"]
        end
        
        subgraph RulesFrontend ["⚙️ Rules Engine"]
            RulesMain["Rules Dashboard"]
            RuleBuilder["Rule Builder"]
            RuleTypes["Rule Types"]
        end
        
        subgraph TrafficFrontend ["🛡️ Traffic Interception"]
            TrafficMain["Traffic Dashboard"]
            TrafficOps["Traffic Operations"]
            TrafficAnalytics["Traffic Analytics"]
        end
    end

    %% Backend Layer
    subgraph Backend ["⚙️ Backend Layer"]
        subgraph APIGateway ["🚪 API Gateway"]
            AuthService["Authentication"]
            RateLimit["Rate Limiting"]
            RequestRouting["Request Routing"]
        end
        
        subgraph DomainBackend ["🌐 Domain Backend"]
            DomainService["Domain Service"]
            DomainVerification["Domain Verification"]
            DomainConfig["Domain Configuration"]
        end
        
        subgraph RulesBackend ["⚙️ Rules Backend"]
            RulesService["Rules Service"]
            RuleEngine["Rule Engine"]
            RuleTemplates["Rule Templates"]
        end
        
        subgraph TrafficBackend ["🛡️ Traffic Backend"]
            TrafficInterceptor["Traffic Interceptor"]
            TrafficProcessor["Traffic Processor"]
            TrafficAnalyticsBackend["Traffic Analytics"]
        end
        
        subgraph DataLayer ["💾 Data Layer"]
            DBModels["Database Models"]
            CacheLayer["Cache Layer"]
        end
    end

    %% External Services
    subgraph External ["🌍 External Services"]
        DNSServices["DNS Services"]
        SSLCA["SSL Authorities"]
        CDNProviders["CDN Providers"]
        GeoIPServices["GeoIP Services"]
    end

    %% Dependencies
    DashboardMain -.-> AnalyticsMain
    DomainMain -.-> DomainOps
    RulesMain -.-> RuleBuilder
    TrafficMain -.-> TrafficOps
    
    APIGateway -.-> DomainBackend
    APIGateway -.-> RulesBackend
    APIGateway -.-> TrafficBackend
    
    DomainBackend -.-> DataLayer
    RulesBackend -.-> DataLayer
    TrafficBackend -.> DataLayer
    
    DomainFrontend -.-> DomainBackend
    RulesFrontend -.-> RulesBackend
    TrafficFrontend -.-> TrafficBackend
    
    DomainBackend -.-> External
    TrafficBackend -.-> External

    %% Apply Styling
    class Frontend,Dashboard,DomainFrontend,RulesFrontend,TrafficFrontend frontend
    class Backend,APIGateway,DomainBackend,RulesBackend,TrafficBackend backend
    class DataLayer data
    class External external
```

## Features

- **Frontend Layer**: Dashboard, Domain Management, Rules Engine, Traffic Interception
- **Backend Layer**: API Gateway, Services, Data Layer
- **External Services**: DNS, SSL, CDN, GeoIP
- **Dependencies**: Dashed arrows showing relationships
