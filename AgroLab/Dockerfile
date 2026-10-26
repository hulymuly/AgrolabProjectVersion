# Этап сборки
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY . .

# Явно указываем, что appsettings.Production.json нужен
COPY appsettings.Production.json ./appsettings.Production.json

RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

# Этап выполнения
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Копируем опубликованное приложение (вместе с appsettings.Production.json)
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 5005
ENTRYPOINT ["dotnet", "AgroLab.dll"]
