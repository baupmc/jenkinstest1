USE [galaxy_new]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		bonic
-- Create date: 2017-05-09
-- Description:	Set CoMIT Tag Permission
-- =============================================

CREATE PROCEDURE [dbo].[uspComitSetTagPermission] 
(@groupId uniqueidentifier, @tagId uniqueidentifier, @permissionId uniqueidentifier, @permissionTypeId uniqueidentifier, @value bit)

AS 

INSERT INTO [Permission] ([Id], [PermissionTypeId], [Value])
VALUES (@permissionId, @permissionTypeId, @value);

INSERT INTO [CoMIT_GroupTagPermission] ([GroupId], [TagId], [PermissionId])
VALUES (@groupId, @tagId, @permissionId);