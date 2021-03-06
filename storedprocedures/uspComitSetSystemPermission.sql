USE [galaxy_new]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		bonic
-- Create date: 2017-05-09
-- Description:	Set CoMIT System Permissions
-- =============================================

CREATE PROCEDURE [dbo].[uspComitSetSystemPermission] (@groupId uniqueidentifier, @permissionId uniqueidentifier, @permissionTypeId uniqueidentifier, @value bit)

AS 

INSERT INTO [Permission] ([Id], [PermissionTypeId], [Value])
VALUES (@permissionId, @permissionTypeId, @value);

INSERT INTO [CoMIT_GroupSystemPermission] ([GroupId], [PermissionId])
VALUES (@groupId, @permissionId);